// Copyright 2024 gorse Project Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package worker

import (
    "context"
    "testing"
    "time"

    mapset "github.com/deckarep/golang-set/v2"
    "github.com/stretchr/testify/assert"
    "github.com/zhenghaoz/gorse/base/encoding"
    "github.com/zhenghaoz/gorse/config"
    "github.com/zhenghaoz/gorse/storage/cache"
    "github.com/zhenghaoz/gorse/storage/data"
)

func TestImageBasedRecommender_Recommend(t *testing.T) {
    // Create test worker
    w := newMockWorker(t)
    defer w.Close()

    // Configure image embeddings
    w.Config.Recommend.ImageEmbeddings.NumSimilar = 10
    w.Config.Recommend.ImageEmbeddings.ImageWeight = 1.0
    w.Config.Recommend.CacheSize = 100

    // Create recommender
    recommender := NewImageBasedRecommender(w)

    // Test data
    userId := "user1"
    categories := []string{"category1", "category2"}
    excludeSet := mapset.NewSet[string]()
    itemCache := NewItemCache(w.DataClient)

    // Setup test data
    ctx := context.Background()
    setupTestData(t, w, userId)

    // Test recommendation
    t.Run("basic recommendation", func(t *testing.T) {
        recommendations, duration, err := recommender.Recommend(ctx, userId, categories, excludeSet, itemCache)
        assert.NoError(t, err)
        assert.Greater(t, duration, time.Duration(0))

        // Check recommendations for each category
        for _, category := range append([]string{""}, categories...) {
            items := recommendations[category]
            assert.NotEmpty(t, items)
            assert.LessOrEqual(t, len(items), w.Config.Recommend.CacheSize)
        }
    })

    t.Run("empty user history", func(t *testing.T) {
        recommendations, _, err := recommender.Recommend(ctx, "nonexistent_user", categories, excludeSet, itemCache)
        assert.NoError(t, err)
        for _, items := range recommendations {
            assert.Empty(t, items)
        }
    })

    t.Run("excluded items", func(t *testing.T) {
        excludeSet := mapset.NewSet("item2", "item3")
        recommendations, _, err := recommender.Recommend(ctx, userId, categories, excludeSet, itemCache)
        assert.NoError(t, err)
        for _, items := range recommendations {
            for _, item := range items {
                assert.False(t, excludeSet.Contains(item))
            }
        }
    })

    t.Run("category filtering", func(t *testing.T) {
        singleCategory := []string{"category1"}
        recommendations, _, err := recommender.Recommend(ctx, userId, singleCategory, excludeSet, itemCache)
        assert.NoError(t, err)
        assert.Contains(t, recommendations, "")           // Should have uncategorized recommendations
        assert.Contains(t, recommendations, "category1")  // Should have category1 recommendations
        assert.NotContains(t, recommendations, "category2")
    })
}

func setupTestData(t *testing.T, w *Worker, userId string) {
    ctx := context.Background()

    // Insert feedback data
    feedbacks := []data.Feedback{
        {FeedbackKey: data.FeedbackKey{UserId: userId, ItemId: "item1", FeedbackType: "like"}, Timestamp: time.Now()},
        {FeedbackKey: data.FeedbackKey{UserId: userId, ItemId: "item2", FeedbackType: "like"}, Timestamp: time.Now()},
    }
    for _, feedback := range feedbacks {
        err := w.DataClient.InsertFeedback(ctx, feedback)
        assert.NoError(t, err)
    }

    // Insert items
    items := []data.Item{
        {ItemId: "item1", Categories: []string{"category1"}, IsHidden: false, Timestamp: time.Now()},
        {ItemId: "item2", Categories: []string{"category1"}, IsHidden: false, Timestamp: time.Now()},
        {ItemId: "item3", Categories: []string{"category2"}, IsHidden: false, Timestamp: time.Now()},
        {ItemId: "item4", Categories: []string{"category2"}, IsHidden: false, Timestamp: time.Now()},
    }
    for _, item := range items {
        err := w.DataClient.InsertItem(ctx, item)
        assert.NoError(t, err)
    }

    // Insert image similarity scores
    similarities := []cache.Score{
        {Id: "item3", Score: 0.8},
        {Id: "item4", Score: 0.6},
    }
    err := w.CacheClient.SetScores(ctx, cache.ImageSimilar, "item1", similarities)
    assert.NoError(t, err)

    similarities = []cache.Score{
        {Id: "item3", Score: 0.7},
        {Id: "item4", Score: 0.9},
    }
    err = w.CacheClient.SetScores(ctx, cache.ImageSimilar, "item2", similarities)
    assert.NoError(t, err)
} 