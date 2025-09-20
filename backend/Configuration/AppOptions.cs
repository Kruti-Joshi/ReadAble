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

    /// <summary>
    /// Reading level configurations
    /// </summary>
    public Dictionary<string, ReadingLevelConfig> ReadingLevels { get; set; } = new();

    /// <summary>
    /// Length option configurations
    /// </summary>
    public Dictionary<string, LengthConfig> LengthOptions { get; set; } = new();
}

/// <summary>
/// Configuration for a specific reading level
/// </summary>
public class ReadingLevelConfig
{
    /// <summary>
    /// Maximum words per sentence for this reading level
    /// </summary>
    public int MaxWordsPerSentence { get; set; }

    /// <summary>
    /// Vocabulary level description
    /// </summary>
    public string VocabularyLevel { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable description
    /// </summary>
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Configuration for length options
/// </summary>
public class LengthConfig
{
    /// <summary>
    /// Compression ratio (1.0 = same length, 0.5 = half length, 1.5 = 50% longer)
    /// </summary>
    public double CompressionRatio { get; set; }

    /// <summary>
    /// Human-readable description
    /// </summary>
    public string Description { get; set; } = string.Empty;
}