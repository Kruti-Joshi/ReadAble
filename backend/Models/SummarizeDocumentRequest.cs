    using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ReadAble.Backend.Models;

/// <summary>
/// Request model for document summarization
/// </summary>
public class SummarizeDocumentRequest
{
    /// <summary>
    /// Unique identifier for the document
    /// </summary>
    [Required]
    [JsonPropertyName("docId")]
    public string DocId { get; set; } = string.Empty;

    /// <summary>
    /// Summarization options
    /// </summary>
    [JsonPropertyName("options")]
    public SummarizationOptions? Options { get; set; }

    /// <summary>
    /// Document chunks to process
    /// </summary>
    [Required]
    [JsonPropertyName("chunks")]
    public List<DocumentChunk> Chunks { get; set; } = new();
}

/// <summary>
/// Summarization options
/// </summary>
public class SummarizationOptions
{
    // Empty options class - using default accessibility settings
    // All configuration is handled through the ReadAble system prompt
}

/// <summary>
/// Document chunk to be processed
/// </summary>
public class DocumentChunk
{
    /// <summary>
    /// Unique identifier for the chunk
    /// </summary>
    [Required]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Sequence number of the chunk
    /// </summary>
    [JsonPropertyName("seq")]
    public int Seq { get; set; }

    /// <summary>
    /// Start position in the original document
    /// </summary>
    [JsonPropertyName("start")]
    public int Start { get; set; }

    /// <summary>
    /// End position in the original document
    /// </summary>
    [JsonPropertyName("end")]
    public int End { get; set; }

    /// <summary>
    /// Estimated token count for the chunk
    /// </summary>
    [JsonPropertyName("tokenEstimate")]
    public int TokenEstimate { get; set; }

    /// <summary>
    /// The text content of the chunk
    /// </summary>
    [Required]
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}