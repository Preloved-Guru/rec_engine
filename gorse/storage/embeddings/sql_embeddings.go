package embeddings

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/juju/errors"
	"github.com/zhenghaoz/gorse/storage/cache"
)

// SQLEmbeddingStore is the SQL implementation of EmbeddingStore.
type SQLEmbeddingStore struct {
	db *sql.DB
}

// NewSQLEmbeddingStore creates a new SQLEmbeddingStore.
func NewSQLEmbeddingStore(db *sql.DB) *SQLEmbeddingStore {
	return &SQLEmbeddingStore{db: db}
}

// GetEmbedding retrieves an embedding by item ID.
func (s *SQLEmbeddingStore) GetEmbedding(ctx context.Context, itemId string) (*ItemEmbedding, error) {
	var (
		vectorBytes []byte
		timestamp   time.Time
	)
	err := s.db.QueryRowContext(ctx, "SELECT vector, timestamp FROM item_embeddings WHERE item_id = ?", itemId).
		Scan(&vectorBytes, &timestamp)
	if err == sql.ErrNoRows {
		return nil, errors.NotFound
	} else if err != nil {
		return nil, errors.Trace(err)
	}
	
	var vector []float64
	if err = json.Unmarshal(vectorBytes, &vector); err != nil {
		return nil, errors.Trace(err)
	}
	
	return &ItemEmbedding{
		ItemId:    itemId,
		Vector:    vector,
		Timestamp: timestamp,
	}, nil
}

// BatchGetEmbeddings retrieves embeddings for multiple items.
func (s *SQLEmbeddingStore) BatchGetEmbeddings(ctx context.Context, itemIds []string) (map[string]*ItemEmbedding, error) {
	placeholders := make([]string, len(itemIds))
	args := make([]interface{}, len(itemIds))
	for i := range itemIds {
		placeholders[i] = "?"
		args[i] = itemIds[i]
	}
	query := fmt.Sprintf("SELECT item_id, vector, timestamp FROM item_embeddings WHERE item_id IN (%s)",
		strings.Join(placeholders, ","))
	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, errors.Trace(err)
	}
	defer rows.Close()

	results := make(map[string]*ItemEmbedding)
	for rows.Next() {
		var (
			itemId      string
			vectorBytes []byte
			timestamp   time.Time
		)
		if err = rows.Scan(&itemId, &vectorBytes, &timestamp); err != nil {
			return nil, errors.Trace(err)
		}
		var vector []float64
		if err = json.Unmarshal(vectorBytes, &vector); err != nil {
			return nil, errors.Trace(err)
		}
		results[itemId] = &ItemEmbedding{
			ItemId:    itemId,
			Vector:    vector,
			Timestamp: timestamp,
		}
	}
	return results, nil
}

// StoreEmbedding stores an embedding.
func (s *SQLEmbeddingStore) StoreEmbedding(ctx context.Context, embedding *ItemEmbedding) error {
	vectorBytes, err := json.Marshal(embedding.Vector)
	if err != nil {
		return errors.Trace(err)
	}
	
	_, err = s.db.ExecContext(ctx,
		"INSERT INTO item_embeddings (item_id, vector, timestamp) VALUES (?, ?, ?) "+
			"ON DUPLICATE KEY UPDATE vector = ?, timestamp = ?",
		embedding.ItemId, vectorBytes, embedding.Timestamp,
		vectorBytes, embedding.Timestamp)
	return errors.Trace(err)
}

// BatchStoreEmbeddings stores multiple embeddings.
func (s *SQLEmbeddingStore) BatchStoreEmbeddings(ctx context.Context, embeddings []*ItemEmbedding) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return errors.Trace(err)
	}
	
	stmt, err := tx.PrepareContext(ctx,
		"INSERT INTO item_embeddings (item_id, vector, timestamp) VALUES (?, ?, ?) "+
			"ON DUPLICATE KEY UPDATE vector = ?, timestamp = ?")
	if err != nil {
		return errors.Trace(err)
	}
	defer stmt.Close()
	
	for _, embedding := range embeddings {
		vectorBytes, err := json.Marshal(embedding.Vector)
		if err != nil {
			_ = tx.Rollback()
			return errors.Trace(err)
		}
		
		if _, err = stmt.ExecContext(ctx,
			embedding.ItemId, vectorBytes, embedding.Timestamp,
			vectorBytes, embedding.Timestamp); err != nil {
			_ = tx.Rollback()
			return errors.Trace(err)
		}
	}
	
	return errors.Trace(tx.Commit())
}

// DeleteEmbedding removes an embedding.
func (s *SQLEmbeddingStore) DeleteEmbedding(ctx context.Context, itemId string) error {
	_, err := s.db.ExecContext(ctx, "DELETE FROM item_embeddings WHERE item_id = ?", itemId)
	return errors.Trace(err)
}

// GetSimilarItems finds items with similar embeddings.
func (s *SQLEmbeddingStore) GetSimilarItems(ctx context.Context, itemId string, n int) ([]cache.Score, error) {
	// Get the source embedding
	sourceEmb, err := s.GetEmbedding(ctx, itemId)
	if err != nil {
		return nil, errors.Trace(err)
	}

	// Get all embeddings
	rows, err := s.db.QueryContext(ctx, "SELECT item_id, vector FROM item_embeddings")
	if err != nil {
		return nil, errors.Trace(err)
	}
	defer rows.Close()

	scores := make([]cache.Score, 0)
	for rows.Next() {
		var (
			targetId    string
			vectorBytes []byte
		)
		if err = rows.Scan(&targetId, &vectorBytes); err != nil {
			return nil, errors.Trace(err)
		}

		if targetId != itemId {
			var vector []float64
			if err = json.Unmarshal(vectorBytes, &vector); err != nil {
				return nil, errors.Trace(err)
			}

			similarity := cosineSimilarity(sourceEmb.Vector, vector)
			scores = append(scores, cache.Score{
				Id:    targetId,
				Score: similarity,
			})
		}
	}

	// Sort by similarity and return top N
	cache.SortDocuments(scores)
	if len(scores) > n {
		scores = scores[:n]
	}
	return scores, nil
}

// Scan retrieves embeddings with pagination.
func (s *SQLEmbeddingStore) Scan(ctx context.Context, offset, limit int) ([]*ItemEmbedding, error) {
	rows, err := s.db.QueryContext(ctx,
		"SELECT item_id, vector, timestamp FROM item_embeddings ORDER BY item_id LIMIT ? OFFSET ?",
		limit, offset)
	if err != nil {
		return nil, errors.Trace(err)
	}
	defer rows.Close()

	var results []*ItemEmbedding
	for rows.Next() {
		var (
			itemId      string
			vectorBytes []byte
			timestamp   time.Time
		)
		if err = rows.Scan(&itemId, &vectorBytes, &timestamp); err != nil {
			return nil, errors.Trace(err)
		}
		var vector []float64
		if err = json.Unmarshal(vectorBytes, &vector); err != nil {
			return nil, errors.Trace(err)
		}
		results = append(results, &ItemEmbedding{
			ItemId:    itemId,
			Vector:    vector,
			Timestamp: timestamp,
		})
	}
	return results, nil
}

// cosineSimilarity calculates the cosine similarity between two vectors.
func cosineSimilarity(a, b []float64) float64 {
	var dotProduct, normA, normB float64
	for i := range a {
		dotProduct += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}
	if normA == 0 || normB == 0 {
		return 0
	}
	return dotProduct / (sqrt(normA) * sqrt(normB))
}

func sqrt(x float64) float64 {
	if x <= 0 {
		return 0
	}
	return float64(math.Sqrt(float64(x)))
} 