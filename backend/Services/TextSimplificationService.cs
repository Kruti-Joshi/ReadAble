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
    private readonly AzureOpenAIClient _openAIClient;
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
        _logger.LogInformation("Simplifying text for reading level: {ReadingLevel}, length: {Length}", 
            options.ReadingLevel, options.Length);

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
            var readingLevel = options.ReadingLevel ?? "grade6";
            var length = options.Length ?? "medium";

            // Get configuration for the reading level
            var levelConfig = _readAbleOptions.ReadingLevels.GetValueOrDefault(readingLevel);
            var lengthConfig = _readAbleOptions.LengthOptions.GetValueOrDefault(length);

            // Build user prompt with specific instructions
            var userPrompt = BuildUserPrompt(text, readingLevel, length, levelConfig, lengthConfig);

            _logger.LogDebug("Calling Azure OpenAI with deployment: {DeploymentName}", _azureOpenAIOptions.DeploymentName);

            // Initialize the ChatClient with the specified deployment name
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
    /// Builds the user prompt with specific instructions for the reading level and length
    /// </summary>
    private static string BuildUserPrompt(string text, string readingLevel, string length, ReadingLevelConfig? levelConfig, LengthConfig? lengthConfig)
    {
        var prompt = $"Please simplify the following text for {readingLevel} reading level";
        
        if (levelConfig != null)
        {
            prompt += $" (max {levelConfig.MaxWordsPerSentence} words per sentence, {levelConfig.VocabularyLevel} vocabulary)";
        }

        if (lengthConfig != null)
        {
            prompt += $" with {length} length ({lengthConfig.Description})";
        }

        prompt += ":\n\n" + text;
        
        return prompt;
    }

    /// <summary>
    /// Mock implementation as fallback
    /// </summary>
    private async Task<string> SimplifyWithMockAsync(string text, SummarizationOptions options, CancellationToken cancellationToken)
    {
        // Simulate API call delay
        await Task.Delay(100, cancellationToken);

        // Mock simplification based on reading level
        var simplified = options.ReadingLevel?.ToLower() switch
        {
            "grade3" => SimplifyForGrade3(text, options.Length),
            "grade6" => SimplifyForGrade6(text, options.Length),
            "grade9" => SimplifyForGrade9(text, options.Length),
            "college" => SimplifyForCollege(text, options.Length),
            _ => SimplifyForGrade6(text, options.Length)
        };

        return simplified;
    }

    private static string SimplifyForGrade3(string text, string? length)
    {
        // Very simple language for grade 3
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
            .Replace("moreover", "also", StringComparison.OrdinalIgnoreCase);

        return length?.ToLower() == "short" 
            ? simplified.Substring(0, Math.Min(simplified.Length, (int)(simplified.Length * 0.6)))
            : simplified;
    }

    private static string SimplifyForGrade6(string text, string? length)
    {
        // Moderate simplification for grade 6
        var simplified = text
            .Replace("multifaceted", "many-sided", StringComparison.OrdinalIgnoreCase)
            .Replace("heterogeneous", "different", StringComparison.OrdinalIgnoreCase)
            .Replace("synthesizing", "combining", StringComparison.OrdinalIgnoreCase)
            .Replace("cohorts", "groups", StringComparison.OrdinalIgnoreCase)
            .Replace("leverages", "uses", StringComparison.OrdinalIgnoreCase)
            .Replace("enhance", "improve", StringComparison.OrdinalIgnoreCase)
            .Replace("comprehension", "understanding", StringComparison.OrdinalIgnoreCase);

        return length?.ToLower() == "short" 
            ? simplified.Substring(0, Math.Min(simplified.Length, (int)(simplified.Length * 0.7)))
            : simplified;
    }

    private static string SimplifyForGrade9(string text, string? length)
    {
        // Light simplification for grade 9
        var simplified = text
            .Replace("multifaceted approach", "comprehensive method", StringComparison.OrdinalIgnoreCase)
            .Replace("heterogeneous user cohorts", "diverse user groups", StringComparison.OrdinalIgnoreCase)
            .Replace("synthesizing", "combining", StringComparison.OrdinalIgnoreCase)
            .Replace("assistive auditory feedback", "helpful audio feedback", StringComparison.OrdinalIgnoreCase);

        return length?.ToLower() == "short" 
            ? simplified.Substring(0, Math.Min(simplified.Length, (int)(simplified.Length * 0.8)))
            : simplified;
    }

    private static string SimplifyForCollege(string text, string? length)
    {
        // Minimal simplification for college level
        var simplified = text
            .Replace("multifaceted", "comprehensive", StringComparison.OrdinalIgnoreCase)
            .Replace("heterogeneous", "diverse", StringComparison.OrdinalIgnoreCase);

        return length?.ToLower() == "short" 
            ? simplified.Substring(0, Math.Min(simplified.Length, (int)(simplified.Length * 0.9)))
            : simplified;
    }
}