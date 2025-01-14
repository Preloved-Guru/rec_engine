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
    "errors"
    "time"
)

// ItemEmbedding represents an item's image embedding vector
type ItemEmbedding struct {
    ItemId    string    // ID of the item
    Vector    []float64 // The embedding vector
    Timestamp time.Time // When this embedding was last updated
}

// EmbeddingStore defines the interface for storing and retrieving image embeddings
type EmbeddingStore interface {
    // GetEmbedding retrieves a single item's embedding
    GetEmbedding(ctx context.Context, itemId string) (*ItemEmbedding, error)

    // BatchGetEmbeddings retrieves embeddings for multiple items
    BatchGetEmbeddings(ctx context.Context, itemIds []string) (map[string]*ItemEmbedding, error)

    // StoreEmbedding stores a single item's embedding
    StoreEmbedding(ctx context.Context, embedding *ItemEmbedding) error

    // BatchStoreEmbeddings stores multiple item embeddings
    BatchStoreEmbeddings(ctx context.Context, embeddings []*ItemEmbedding) error

    // DeleteEmbedding removes an item's embedding
    DeleteEmbedding(ctx context.Context, itemId string) error

    // GetSimilarItems finds items with similar embeddings
    // Returns itemIds and their similarity scores
    GetSimilarItems(ctx context.Context, itemId string, n int) ([]ScoredItem, error)

    // Scan returns all embeddings with optional offset and limit
    Scan(ctx context.Context, offset, limit int) ([]*ItemEmbedding, error)
}

// ScoredItem represents an item with its similarity score
type ScoredItem struct {
    ItemId string
    Score  float64
}

// Error types for embedding operations
var (
    ErrEmbeddingNotFound = errors.New("embedding not found")
    ErrInvalidDimension  = errors.New("invalid embedding dimension")
) 