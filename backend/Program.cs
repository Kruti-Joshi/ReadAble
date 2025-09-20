using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ReadAble.Backend.Configuration;
using ReadAble.Backend.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureAppConfiguration((context, config) =>
    {
        // Explicitly load appsettings.json
        config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
        
        // Add environment-specific appsettings if they exist
        var env = context.HostingEnvironment.EnvironmentName;
        config.AddJsonFile($"appsettings.{env}.json", optional: true, reloadOnChange: true);
        
        // Add environment variables (this includes local.settings.json values)
        config.AddEnvironmentVariables();
    })
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        
        // Debug: Log configuration sources and values
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger("ConfigDebug");
        
        logger.LogInformation("=== Configuration Debug ===");
        logger.LogInformation("Environment: {Environment}", context.HostingEnvironment.EnvironmentName);
        
        // Check specific Azure OpenAI configuration values
        var endpoint = context.Configuration["AZURE_OPENAI_ENDPOINT"];
        var apiKey = context.Configuration["AZURE_OPENAI_API_KEY"];
        var deployment = context.Configuration["AZURE_OPENAI_DEPLOYMENT_NAME"];
        
        logger.LogInformation("AZURE_OPENAI_ENDPOINT: {Endpoint}", endpoint ?? "NULL");
        logger.LogInformation("AZURE_OPENAI_API_KEY: {HasKey}", !string.IsNullOrEmpty(apiKey) ? "Present" : "NULL");
        logger.LogInformation("AZURE_OPENAI_DEPLOYMENT_NAME: {Deployment}", deployment ?? "NULL");
        
        // Check if appsettings.json ReadAble section exists
        var readableSection = context.Configuration.GetSection("ReadAble");
        logger.LogInformation("ReadAble section exists: {Exists}", readableSection.Exists());

        if (readableSection.Exists())
        {
            var systemPrompt = readableSection["SystemPrompt"];
            logger.LogInformation("ReadAble SystemPrompt from appsettings.json length: {Length}",
                string.IsNullOrEmpty(systemPrompt) ? 0 : systemPrompt.Length);
        }
        else
        {
            // Check environment variable fallback
            var envSystemPrompt = context.Configuration["READABLE_SYSTEM_PROMPT"];
            logger.LogInformation("READABLE_SYSTEM_PROMPT from env/local.settings.json length: {Length}",
                string.IsNullOrEmpty(envSystemPrompt) ? 0 : envSystemPrompt.Length);
        }
        
        logger.LogInformation("=== End Configuration Debug ===");
        
        // Configure Azure OpenAI options from environment variables
        services.Configure<AzureOpenAIOptions>(options =>
        {
            options.Endpoint = context.Configuration["AZURE_OPENAI_ENDPOINT"] ?? string.Empty;
            options.ApiKey = context.Configuration["AZURE_OPENAI_API_KEY"] ?? string.Empty;
            options.DeploymentName = context.Configuration["AZURE_OPENAI_DEPLOYMENT_NAME"] ?? string.Empty;
            options.ApiVersion = context.Configuration["AZURE_OPENAI_API_VERSION"] ?? "2024-06-01";
        });
        
        // Configure ReadAble options from configuration section (appsettings.json) or environment variables (local.settings.json)
        services.Configure<ReadAbleOptions>(options =>
        {
            // Try to bind from appsettings.json section first
            var readableSection = context.Configuration.GetSection("ReadAble");
            if (readableSection.Exists())
            {
                readableSection.Bind(options);
            }
            
            // Override/fallback with environment variable if available (from local.settings.json)
            var envSystemPrompt = context.Configuration["READABLE_SYSTEM_PROMPT"];
            if (!string.IsNullOrEmpty(envSystemPrompt))
            {
                options.SystemPrompt = envSystemPrompt;
                
                // Add default reading levels if not configured
                if (!options.ReadingLevels.Any())
                {
                    options.ReadingLevels = new Dictionary<string, ReadingLevelConfig>
                    {
                        ["grade3"] = new() { MaxWordsPerSentence = 12, VocabularyLevel = "elementary", Description = "Very simple language for early readers" },
                        ["grade6"] = new() { MaxWordsPerSentence = 15, VocabularyLevel = "intermediate", Description = "Clear, accessible language for middle school level" },
                        ["grade9"] = new() { MaxWordsPerSentence = 18, VocabularyLevel = "advanced", Description = "Structured language for high school level" },
                        ["college"] = new() { MaxWordsPerSentence = 22, VocabularyLevel = "academic", Description = "Clear academic language with minimal jargon" }
                    };
                }
                
                // Add default length options if not configured
                if (!options.LengthOptions.Any())
                {
                    options.LengthOptions = new Dictionary<string, LengthConfig>
                    {
                        ["short"] = new() { CompressionRatio = 0.65, Description = "Concise summary focusing on key points" },
                        ["medium"] = new() { CompressionRatio = 1.0, Description = "Complete simplification maintaining all information" },
                        ["long"] = new() { CompressionRatio = 1.3, Description = "Detailed explanation with examples and context" }
                    };
                }
            }
        });
        
        // Add HTTP client for external API calls
        services.AddHttpClient();
        
        // Register custom services
        services.AddScoped<ITextSimplificationService, TextSimplificationService>();
        
        // Configure logging
        services.AddLogging(builder =>
        {
            builder.AddConsole();
            builder.AddApplicationInsights();
        });
    })
    .Build();

host.Run();