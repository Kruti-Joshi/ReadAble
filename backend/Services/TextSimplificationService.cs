using System.Text.Json;
using Azure;
using Azure.AI.OpenAI;
using Google.Protobuf;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using ReadAble.Backend.Configuration;
using ReadAble.Backend.Models;

namespace ReadAble.Backend.Services;

/// <summary>
/// Service for text simplification
/// </summary>
public interface ITextSimplificationService
{
    /// <summary>
    /// Simplifies text based on the provided options
    /// </summary>
    /// <param name="text">Text to simplify</param>
    /// <param name="options">Simplification options</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Simplified text</returns>
    Task<string> SimplifyTextAsync(string text, SummarizationOptions options, CancellationToken cancellationToken = default);
}

/// <summary>
/// Azure OpenAI implementation of text simplification service
/// </summary>
public class TextSimplificationService : ITextSimplificationService
{
    private readonly ILogger<TextSimplificationService> _logger;
    private readonly AzureOpenAIClient? _openAIClient;
    private readonly AzureOpenAIOptions _azureOpenAIOptions;
    private readonly ReadAbleOptions _readAbleOptions;

    public TextSimplificationService(
        ILogger<TextSimplificationService> logger,
        IOptions<AzureOpenAIOptions> azureOpenAIOptions,
        IOptions<ReadAbleOptions> readAbleOptions)
    {
        _logger = logger;
        _azureOpenAIOptions = azureOpenAIOptions.Value;
        _readAbleOptions = readAbleOptions.Value;

        // Log configuration for debugging
        _logger.LogInformation("Azure OpenAI Configuration - Endpoint: {Endpoint}, HasApiKey: {HasApiKey}, DeploymentName: {DeploymentName}",
            _azureOpenAIOptions.Endpoint ?? "NULL", 
            !string.IsNullOrEmpty(_azureOpenAIOptions.ApiKey),
            _azureOpenAIOptions.DeploymentName ?? "NULL");

        // Initialize Azure OpenAI client
        if (!string.IsNullOrEmpty(_azureOpenAIOptions.Endpoint) && !string.IsNullOrEmpty(_azureOpenAIOptions.ApiKey))
        {
            _openAIClient = new AzureOpenAIClient(
                new Uri(_azureOpenAIOptions.Endpoint),
                new AzureKeyCredential(_azureOpenAIOptions.ApiKey));
            
            _logger.LogInformation("Azure OpenAI client initialized successfully");
        }
        else
        {
            _logger.LogWarning("Azure OpenAI not configured. Endpoint: '{Endpoint}', HasApiKey: {HasApiKey}. Using mock implementation.",
                _azureOpenAIOptions.Endpoint ?? "NULL", 
                !string.IsNullOrEmpty(_azureOpenAIOptions.ApiKey));
        }
    }

    public async Task<string> SimplifyTextAsync(string text, SummarizationOptions options, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Simplifying text for accessibility");

        // Use Azure OpenAI if configured, otherwise fall back to mock implementation
        if (_openAIClient != null && !string.IsNullOrEmpty(_azureOpenAIOptions.DeploymentName))
        {
            return await SimplifyWithAzureOpenAIAsync(text, options, cancellationToken);
        }
        else
        {
            _logger.LogWarning("Azure OpenAI not configured. Using mock simplification.");
            return await SimplifyWithMockAsync(text, options, cancellationToken);
        }
    }

    /// <summary>
    /// Simplifies text using Azure OpenAI
    /// </summary>
    private async Task<string> SimplifyWithAzureOpenAIAsync(string text, SummarizationOptions options, CancellationToken cancellationToken)
    {
        try
        {
            // Build simple user prompt
            var userPrompt = $"Please simplify the following text to make it more accessible:\n\n{text}";

            _logger.LogDebug("Calling Azure OpenAI with deployment: {DeploymentName}", _azureOpenAIOptions.DeploymentName);

            // Initialize the ChatClient with the specified deployment name
            if (_openAIClient == null)
            {
                throw new InvalidOperationException("Azure OpenAI client is not initialized");
            }
            
            ChatClient chatClient = _openAIClient.GetChatClient("readable-summarizer");

            var messages = new List<ChatMessage>
            {
                new DeveloperChatMessage(_readAbleOptions.SystemPrompt),
                new UserChatMessage(userPrompt)
            };

            try
            {
                // Create the chat completion request
                ChatCompletion completion = await chatClient.CompleteChatAsync(messages);

                // Print the response
                if (completion != null)
                {
                    Console.WriteLine(JsonSerializer.Serialize(completion.Content[0].Text, new JsonSerializerOptions() { WriteIndented = true }));
                }
                else
                {
                    Console.WriteLine("No response received.");
                }

                return JsonSerializer.Serialize(completion?.Content[0].Text) ?? await SimplifyWithMockAsync(text, options, cancellationToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }

            return await SimplifyWithMockAsync(text, options, cancellationToken);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Azure OpenAI. Falling back to mock implementation.");
            
            return await SimplifyWithMockAsync(text, options, cancellationToken);
        }
    }

    /// <summary>
    /// Mock implementation as fallback
    /// </summary>
    private async Task<string> SimplifyWithMockAsync(string text, SummarizationOptions options, CancellationToken cancellationToken)
    {
        // Simulate API call delay
        await Task.Delay(100, cancellationToken);

        // Simple mock simplification for accessibility
        var simplified = text
            .Replace("utilize", "use", StringComparison.OrdinalIgnoreCase)
            .Replace("utilization", "use", StringComparison.OrdinalIgnoreCase)
            .Replace("methodology", "method", StringComparison.OrdinalIgnoreCase)
            .Replace("methodologies", "methods", StringComparison.OrdinalIgnoreCase)
            .Replace("facilitate", "help", StringComparison.OrdinalIgnoreCase)
            .Replace("facilitates", "helps", StringComparison.OrdinalIgnoreCase)
            .Replace("demonstrate", "show", StringComparison.OrdinalIgnoreCase)
            .Replace("demonstrates", "shows", StringComparison.OrdinalIgnoreCase)
            .Replace("approximately", "about", StringComparison.OrdinalIgnoreCase)
            .Replace("subsequently", "then", StringComparison.OrdinalIgnoreCase)
            .Replace("furthermore", "also", StringComparison.OrdinalIgnoreCase)
            .Replace("moreover", "also", StringComparison.OrdinalIgnoreCase)
            .Replace("multifaceted", "many-sided", StringComparison.OrdinalIgnoreCase)
            .Replace("heterogeneous", "different", StringComparison.OrdinalIgnoreCase)
            .Replace("synthesizing", "combining", StringComparison.OrdinalIgnoreCase)
            .Replace("cohorts", "groups", StringComparison.OrdinalIgnoreCase)
            .Replace("leverages", "uses", StringComparison.OrdinalIgnoreCase)
            .Replace("enhance", "improve", StringComparison.OrdinalIgnoreCase)
            .Replace("comprehension", "understanding", StringComparison.OrdinalIgnoreCase);

        return simplified;
    }
}