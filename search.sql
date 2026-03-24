ALTER TABLE "TrendSignal" ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce("title", '') || ' ' || coalesce("aiSummary", ''))) STORED;
CREATE INDEX idx_trendsignal_search ON "TrendSignal" USING GIN(search_vector);

ALTER TABLE "Idea" ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce("title", '') || ' ' || coalesce("opportunityMemo", ''))) STORED;
CREATE INDEX idx_idea_search ON "Idea" USING GIN(search_vector);
