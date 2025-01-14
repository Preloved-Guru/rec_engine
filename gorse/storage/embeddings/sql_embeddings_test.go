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
package embeddings

import (
    "context"
    "database/sql"
    "testing"
    "time"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/suite"
    "github.com/zhenghaoz/gorse/storage/data"
)

type SQLEmbeddingStoreTestSuite struct {
    suite.Suite
    db    *sql.DB
    store *SQLEmbeddingStore
}

func (s *SQLEmbeddingStoreTestSuite) SetupSuite() {
    var err error
    s.db, err = data.Open("sqlite3", ":memory:", "")
    s.Require().NoError(err)
    s.store, err = NewSQLEmbeddingStore(s.db, "item_embeddings")
    s.Require().NoError(err)
}

func (s *SQLEmbeddingStoreTestSuite) TearDownSuite() {
    s.NoError(s.db.Close())
}

func (s *SQLEmbeddingStoreTestSuite) SetupTest() {
    _, err := s.db.Exec("DELETE FROM item_embeddings")
    s.Require().NoError(err)
}

func TestSQLEmbeddingStore(t *testing.T) {
    suite.Run(t, new(SQLEmbeddingStoreTestSuite))
}

func (s *SQLEmbeddingStoreTestSuite) TestStoreAndGetEmbedding() {
    ctx := context.Background()
    now := time.Now()

    // Test storing a single embedding
    emb := &ItemEmbedding{
        ItemId:    "item1",
        Vector:    []float64{0.1, 0.2, 0.3},
        Timestamp: now,
    }
    err := s.store.StoreEmbedding(ctx, emb)
    s.NoError(err)

    // Test retrieving the embedding
    retrieved, err := s.store.GetEmbedding(ctx, "item1")
    s.NoError(err)
    s.Equal(emb.ItemId, retrieved.ItemId)
    s.InDelta(0.1, retrieved.Vector[0], 1e-6)
    s.InDelta(0.2, retrieved.Vector[1], 1e-6)
    s.InDelta(0.3, retrieved.Vector[2], 1e-6)
    s.Equal(now.Unix(), retrieved.Timestamp.Unix())

    // Test getting non-existent embedding
    _, err = s.store.GetEmbedding(ctx, "nonexistent")
    s.Equal(ErrEmbeddingNotFound, err)
}

func (s *SQLEmbeddingStoreTestSuite) TestBatchStoreAndGet() {
    ctx := context.Background()
    now := time.Now()

    // Test batch storing
    embeddings := []*ItemEmbedding{
        {
            ItemId:    "item1",
            Vector:    []float64{0.1, 0.2, 0.3},
            Timestamp: now,
        },
        {
            ItemId:    "item2",
            Vector:    []float64{0.4, 0.5, 0.6},
            Timestamp: now,
        },
    }
    err := s.store.BatchStoreEmbeddings(ctx, embeddings)
    s.NoError(err)

    // Test batch retrieval
    retrieved, err := s.store.BatchGetEmbeddings(ctx, []string{"item1", "item2", "nonexistent"})
    s.NoError(err)
    s.Len(retrieved, 2)
    s.InDelta(0.1, retrieved["item1"].Vector[0], 1e-6)
    s.InDelta(0.4, retrieved["item2"].Vector[0], 1e-6)
}

func (s *SQLEmbeddingStoreTestSuite) TestDeleteEmbedding() {
    ctx := context.Background()
    now := time.Now()

    // Store an embedding
    emb := &ItemEmbedding{
        ItemId:    "item1",
        Vector:    []float64{0.1, 0.2, 0.3},
        Timestamp: now,
    }
    err := s.store.StoreEmbedding(ctx, emb)
    s.NoError(err)

    // Delete it
    err = s.store.DeleteEmbedding(ctx, "item1")
    s.NoError(err)

    // Verify it's gone
    _, err = s.store.GetEmbedding(ctx, "item1")
    s.Equal(ErrEmbeddingNotFound, err)
}

func (s *SQLEmbeddingStoreTestSuite) TestGetSimilarItems() {
    ctx := context.Background()
    now := time.Now()

    // Store some embeddings
    embeddings := []*ItemEmbedding{
        {
            ItemId:    "item1",
            Vector:    []float64{1.0, 0.0, 0.0},
            Timestamp: now,
        },
        {
            ItemId:    "item2",
            Vector:    []float64{0.866, 0.5, 0.0}, // 30 degrees from item1
            Timestamp: now,
        },
        {
            ItemId:    "item3",
            Vector:    []float64{0.0, 1.0, 0.0}, // 90 degrees from item1
            Timestamp: now,
        },
    }
    err := s.store.BatchStoreEmbeddings(ctx, embeddings)
    s.NoError(err)

    // Get similar items
    similar, err := s.store.GetSimilarItems(ctx, "item1", 2)
    s.NoError(err)
    s.Len(similar, 2)
    
    // item2 should be most similar to item1
    s.Equal("item2", similar[0].ItemId)
    s.InDelta(0.866, similar[0].Score, 1e-3)
    
    // item3 should be less similar
    s.Equal("item3", similar[1].ItemId)
    s.InDelta(0.0, similar[1].Score, 1e-3)
}

func (s *SQLEmbeddingStoreTestSuite) TestScan() {
    ctx := context.Background()
    now := time.Now()

    // Store some embeddings
    embeddings := []*ItemEmbedding{
        {
            ItemId:    "item1",
            Vector:    []float64{0.1, 0.2, 0.3},
            Timestamp: now,
        },
        {
            ItemId:    "item2",
            Vector:    []float64{0.4, 0.5, 0.6},
            Timestamp: now,
        },
        {
            ItemId:    "item3",
            Vector:    []float64{0.7, 0.8, 0.9},
            Timestamp: now,
        },
    }
    err := s.store.BatchStoreEmbeddings(ctx, embeddings)
    s.NoError(err)

    // Test scanning with limit
    scanned, err := s.store.Scan(ctx, 0, 2)
    s.NoError(err)
    s.Len(scanned, 2)

    // Test scanning with offset
    scanned, err = s.store.Scan(ctx, 2, 2)
    s.NoError(err)
    s.Len(scanned, 1)

    // Test scanning all
    scanned, err = s.store.Scan(ctx, 0, -1)
    s.NoError(err)
    s.Len(scanned, 3)
} 