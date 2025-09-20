using System.Text.Json.Serialization;

namespace ReadAble.Backend.Models;

/// <summary>
/// Response model for document summarization
/// </summary>
public class SummarizeDocumentResponse
{
    /// <summary>
    /// Document identifier
    /// </summary>
    [JsonPropertyName("docId")]
    public string DocId { get; set; } = string.Empty;

    /// <summary>
    /// Processing timestamp
    /// </summary>
    [JsonPropertyName("processedAt")]
    public DateTime ProcessedAt { get; set; }

    /// <summary>
    /// Original summarization options
    /// </summary>
    [JsonPropertyName("options")]
    public SummarizationOptions? Options { get; set; }

    /// <summary>
    /// Processing summary
    /// </summary>
    [JsonPropertyName("summary")]
    public ProcessingSummary Summary { get; set; } = new();

    /// <summary>
    /// Processed chunks
    /// </summary>
    [JsonPropertyName("chunks")]
    public List<ProcessedChunk> Chunks { get; set; } = new();
}

/// <summary>
/// Summary of the processing operation
/// </summary>
public class ProcessingSummary
{
    /// <summary>
    /// Total number of chunks processed
    /// </summary>
    [JsonPropertyName("totalChunks")]
    public int TotalChunks { get; set; }

    /// <summary>
    /// Total estimated tokens processed
    /// </summary>
    [JsonPropertyName("totalTokensEstimate")]
    public int TotalTokensEstimate { get; set; }
}

/// <summary>
/// A processed document chunk
/// </summary>
public class ProcessedChunk
{
    /// <summary>
    /// Chunk identifier
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Sequence number
    /// </summary>
    [JsonPropertyName("seq")]
    public int Seq { get; set; }

    /// <summary>
    /// Start position in original document
    /// </summary>
    [JsonPropertyName("start")]
    public int Start { get; set; }

    /// <summary>
    /// End position in original document
    /// </summary>
    [JsonPropertyName("end")]
    public int End { get; set; }

    /// <summary>
    /// Original token estimate
    /// </summary>
    [JsonPropertyName("originalTokenEstimate")]
    public int OriginalTokenEstimate { get; set; }

    /// <summary>
    /// Original text content
    /// </summary>
    [JsonPropertyName("originalText")]
    public string OriginalText { get; set; } = string.Empty;

    /// <summary>
    /// Simplified text content
    /// </summary>
    [JsonPropertyName("simplifiedText")]
    public string SimplifiedText { get; set; } = string.Empty;

    /// <summary>
    /// Ratio of simplified to original text length
    /// </summary>
    [JsonPropertyName("simplificationRatio")]
    public double SimplificationRatio { get; set; }

    /// <summary>
    /// Reading level achieved
    /// </summary>
    [JsonPropertyName("readingLevel")]
    public string ReadingLevel { get; set; } = string.Empty;

    /// <summary>
    /// Processing timestamp
    /// </summary>
    [JsonPropertyName("processedAt")]
    public DateTime ProcessedAt { get; set; }

    /// <summary>
    /// Error message if processing failed
    /// </summary>
    [JsonPropertyName("error")]
    public string? Error { get; set; }
}

/// <summary>
/// Error response model
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// Error message
    /// </summary>
    [JsonPropertyName("error")]
    public string Error { get; set; } = string.Empty;

    /// <summary>
    /// Error details
    /// </summary>
    [JsonPropertyName("details")]
    public List<string>? Details { get; set; }

    /// <summary>
    /// Error message for user display
    /// </summary>
    [JsonPropertyName("message")]
    public string? Message { get; set; }
}