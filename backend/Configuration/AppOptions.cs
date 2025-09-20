namespace ReadAble.Backend.Configuration;

/// <summary>
/// Configuration settings for Azure OpenAI
/// </summary>
public class AzureOpenAIOptions
{
    public const string SectionName = "AzureOpenAI";

    /// <summary>
    /// Azure OpenAI endpoint URL
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// Azure OpenAI API key
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Deployment name for the model
    /// </summary>
    public string DeploymentName { get; set; } = string.Empty;

    /// <summary>
    /// API version to use
    /// </summary>
    public string ApiVersion { get; set; } = "2024-06-01";
}

/// <summary>
/// Configuration settings for ReadAble application
/// </summary>
public class ReadAbleOptions
{
    public const string SectionName = "ReadAble";

    /// <summary>
    /// System prompt for AI model
    /// </summary>
    public string SystemPrompt { get; set; } = string.Empty;
}