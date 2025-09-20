using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using ReadAble.Backend.Models;
using ReadAble.Backend.Services;

namespace ReadAble.Backend.Functions;

/// <summary>
/// Azure Function for document summarization
/// </summary>
public class SummarizeDocumentFunction
{
    private readonly ILogger<SummarizeDocumentFunction> _logger;
    private readonly ITextSimplificationService _textSimplificationService;

    public SummarizeDocumentFunction(
        ILogger<SummarizeDocumentFunction> logger,
        ITextSimplificationService textSimplificationService)
    {
        _logger = logger;
        _textSimplificationService = textSimplificationService;
    }

    /// <summary>
    /// HTTP-triggered function for document summarization
    /// </summary>
    /// <param name="req">HTTP request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>HTTP response with summarized document</returns>
    [Function("SummarizeDocument")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", "options", Route = "summarize")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Document summarization request received");

        // Handle CORS preflight requests
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return CreateCorsResponse(req, HttpStatusCode.OK);
        }

        try
        {
            // Parse request body
            var requestBody = await JsonSerializer.DeserializeAsync<SummarizeDocumentRequest>(
                req.Body, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }, 
                cancellationToken);

            if (requestBody == null)
            {
                _logger.LogWarning("Request body is null or invalid");
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid request body");
            }

            // Validate input
            var validationResults = ValidateRequest(requestBody);
            if (validationResults.Any())
            {
                _logger.LogWarning("Request validation failed: {Errors}", string.Join(", ", validationResults));
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid input", validationResults);
            }

            _logger.LogInformation("Processing document {DocId} with {ChunkCount} chunks", 
                requestBody.DocId, requestBody.Chunks.Count);

            // Process chunks
            var processedChunks = await ProcessDocumentChunksAsync(
                requestBody.Chunks, 
                requestBody.Options ?? new SummarizationOptions(), 
                cancellationToken);

            // Create response
            var response = new SummarizeDocumentResponse
            {
                DocId = requestBody.DocId,
                ProcessedAt = DateTime.UtcNow,
                Options = requestBody.Options,
                Summary = new ProcessingSummary
                {
                    TotalChunks = requestBody.Chunks.Count,
                    TotalTokensEstimate = requestBody.Chunks.Sum(c => c.TokenEstimate)
                },
                Chunks = processedChunks
            };

            _logger.LogInformation("Successfully processed document {DocId}", requestBody.DocId);

            return await CreateJsonResponse(req, response, HttpStatusCode.OK);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error parsing JSON request body");
            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid JSON in request body");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing document summarization request");
            return await CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Internal server error");
        }
    }

    /// <summary>
    /// Validates the summarization request
    /// </summary>
    private static List<string> ValidateRequest(SummarizeDocumentRequest request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.DocId))
        {
            errors.Add("DocId is required");
        }

        if (request.Chunks == null || !request.Chunks.Any())
        {
            errors.Add("At least one chunk is required");
        }
        else
        {
            for (int i = 0; i < request.Chunks.Count; i++)
            {
                var chunk = request.Chunks[i];
                if (string.IsNullOrWhiteSpace(chunk.Id))
                {
                    errors.Add($"Chunk[{i}].Id is required");
                }
                if (string.IsNullOrWhiteSpace(chunk.Text))
                {
                    errors.Add($"Chunk[{i}].Text is required");
                }
                if (chunk.TokenEstimate <= 0)
                {
                    errors.Add($"Chunk[{i}].TokenEstimate must be greater than 0");
                }
            }
        }

        if (request.Options != null)
        {
            // Options validation can be added here if needed in the future
            // Currently using simple accessibility configuration
        }

        return errors;
    }

    /// <summary>
    /// Processes document chunks for summarization
    /// </summary>
    private async Task<List<ProcessedChunk>> ProcessDocumentChunksAsync(
        List<DocumentChunk> chunks, 
        SummarizationOptions options, 
        CancellationToken cancellationToken)
    {
        var processedChunks = new List<ProcessedChunk>();

        foreach (var chunk in chunks)
        {
            try
            {
                _logger.LogDebug("Processing chunk {ChunkId} (seq: {Seq})", chunk.Id, chunk.Seq);

                var simplifiedText = await _textSimplificationService.SimplifyTextAsync(
                    chunk.Text, options, cancellationToken);

                processedChunks.Add(new ProcessedChunk
                {
                    Id = chunk.Id,
                    Seq = chunk.Seq,
                    Start = chunk.Start,
                    End = chunk.End,
                    OriginalTokenEstimate = chunk.TokenEstimate,
                    OriginalText = chunk.Text,
                    SimplifiedText = simplifiedText,
                    SimplificationRatio = (double)simplifiedText.Length / chunk.Text.Length,
                    ReadingLevel = "accessible", // Fixed reading level for accessibility
                    ProcessedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chunk {ChunkId}", chunk.Id);

                // Return original text if simplification fails
                processedChunks.Add(new ProcessedChunk
                {
                    Id = chunk.Id,
                    Seq = chunk.Seq,
                    Start = chunk.Start,
                    End = chunk.End,
                    OriginalTokenEstimate = chunk.TokenEstimate,
                    OriginalText = chunk.Text,
                    SimplifiedText = chunk.Text,
                    SimplificationRatio = 1.0,
                    ReadingLevel = "original",
                    Error = "Simplification failed",
                    ProcessedAt = DateTime.UtcNow
                });
            }
        }

        return processedChunks;
    }

    /// <summary>
    /// Creates a CORS response
    /// </summary>
    private static HttpResponseData CreateCorsResponse(HttpRequestData req, HttpStatusCode statusCode)
    {
        var response = req.CreateResponse(statusCode);
        AddCorsHeaders(response);
        return response;
    }

    /// <summary>
    /// Creates a JSON response
    /// </summary>
    private static async Task<HttpResponseData> CreateJsonResponse<T>(
        HttpRequestData req, 
        T data, 
        HttpStatusCode statusCode)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");
        AddCorsHeaders(response);

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await response.WriteStringAsync(json);
        return response;
    }

    /// <summary>
    /// Creates an error response
    /// </summary>
    private static async Task<HttpResponseData> CreateErrorResponse(
        HttpRequestData req, 
        HttpStatusCode statusCode, 
        string error, 
        List<string>? details = null)
    {
        var errorResponse = new ErrorResponse
        {
            Error = error,
            Details = details,
            Message = "Failed to process document"
        };

        return await CreateJsonResponse(req, errorResponse, statusCode);
    }

    /// <summary>
    /// Adds CORS headers to the response
    /// </summary>
    private static void AddCorsHeaders(HttpResponseData response)
    {
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.Headers.Add("Access-Control-Max-Age", "86400");
    }
}