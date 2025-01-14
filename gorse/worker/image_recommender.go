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
    "time"

    mapset "github.com/deckarep/golang-set/v2"
    "github.com/juju/errors"
    "github.com/samber/lo"
    "github.com/zhenghaoz/gorse/base/heap"
    "github.com/zhenghaoz/gorse/base/log"
    "github.com/zhenghaoz/gorse/storage/cache"
    "github.com/zhenghaoz/gorse/storage/data"
    "go.uber.org/zap"
)

// ImageBasedRecommender is the recommender using image similarity.
type ImageBasedRecommender struct {
    *Worker
}

// NewImageBasedRecommender creates a new ImageBasedRecommender.
func NewImageBasedRecommender(w *Worker) *ImageBasedRecommender {
    return &ImageBasedRecommender{Worker: w}
}

// Recommend items to a user based on image similarity.
func (r *ImageBasedRecommender) Recommend(ctx context.Context, userId string, categories []string, excludeSet mapset.Set[string], itemCache *ItemCache) (map[string][]string, time.Duration, error) {
    startTime := time.Now()
    candidates := make(map[string][]string)

    // Get user's positive feedback items
    positiveItems, err := r.loadUserPositiveFeedbackItems(ctx, userId)
    if err != nil {
        return nil, 0, errors.Trace(err)
    }

    // For each category (including empty category for all items)
    for _, category := range append([]string{""}, categories...) {
        // Collect candidates with scores
        scores := make(map[string]float64)
        for _, itemId := range positiveItems {
            // Get similar items based on image embeddings
            similarItems, err := r.CacheClient.SearchScores(ctx, cache.ImageSimilar, itemId, []string{category}, 0, r.Config.Recommend.ImageEmbeddings.NumSimilar)
            if err != nil {
                log.Logger().Error("failed to load similar items",
                    zap.String("user_id", userId),
                    zap.String("item_id", itemId),
                    zap.Error(err))
                continue
            }

            // Add unseen items
            for _, item := range similarItems {
                if !excludeSet.Contains(item.Id) && itemCache.IsAvailable(item.Id) {
                    scores[item.Id] += item.Score * r.Config.Recommend.ImageEmbeddings.ImageWeight
                }
            }
        }

        // Get top K items
        filter := heap.NewTopKFilter[string, float64](r.Config.Recommend.CacheSize)
        for id, score := range scores {
            filter.Push(id, score)
        }
        ids, _ := filter.PopAll()
        candidates[category] = ids
    }

    return candidates, time.Since(startTime), nil
}

// loadUserPositiveFeedbackItems loads positive feedback items for a user.
func (r *ImageBasedRecommender) loadUserPositiveFeedbackItems(ctx context.Context, userId string) ([]string, error) {
    now := time.Now()
    feedbacks, err := r.DataClient.GetUserFeedback(ctx, userId, &now, r.Config.Recommend.DataSource.PositiveFeedbackTypes...)
    if err != nil {
        return nil, errors.Trace(err)
    }
    return lo.Map(feedbacks, func(feedback data.Feedback, _ int) string {
        return feedback.ItemId
    }), nil
} 