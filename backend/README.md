# ReadAble Backend - Azure Functions (.NET) with Azure OpenAI

This is the backend API for the ReadAble document simplification service, built using Azure Functions with .NET 8, the isolated process model, and integrated with Azure OpenAI for intelligent text simplification.

## 🚀 Features

- **Azure OpenAI Integration**: Uses GPT models to simplify text for different reading levels
- **Accessibility-Focused**: System prompts specifically designed for learning disabilities
- **HTTP-triggered Function**: Document summarization endpoint
- **.NET 8 Isolated Process**: Latest Azure Functions runtime
- **Multiple Reading Levels**: Support for grade3, grade6, grade9, and college levels
- **Length Options**: Short, medium, and long summaries with configurable compression ratios
- **Fallback System**: Mock implementation when Azure OpenAI is not configured
- **Comprehensive Validation**: Input validation with detailed error messages
- **CORS Support**: Ready for frontend integration
- **Structured Logging**: Application Insights integration
- **Extensible Architecture**: Clean separation of concerns

## 📁 Project Structure

```
backend/
├── Configuration/
│   └── AppOptions.cs                   # Configuration classes
├── Functions/
│   └── SummarizeDocumentFunction.cs    # Main HTTP function
├── Models/
│   ├── SummarizeDocumentRequest.cs     # Request DTOs
│   └── SummarizeDocumentResponse.cs    # Response DTOs
├── Services/
│   └── TextSimplificationService.cs    # Azure OpenAI integration
├── Program.cs                          # App entry point with DI setup
├── appsettings.json                   # App configuration & AI prompts
├── host.json                          # Function host config
├── local.settings.json                # Local development settings
└── ReadAble.Backend.csproj            # Project file
```

## 🛠️ Prerequisites

- **.NET 8 SDK** or later
- **Azure Functions Core Tools v4**
- **Visual Studio 2022** or **VS Code** with C# extension
- **Azure Storage Emulator** (for local development)

## 🏃‍♂️ Getting Started

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Restore NuGet packages
dotnet restore
```

### 2. Local Development

```bash
# Start the Azure Functions runtime
func start

# Or use dotnet command
dotnet run
```

The function will be available at: `http://localhost:7071/api/summarize`

### 3. Test the Function

#### Using curl:
```bash
curl -X POST http://localhost:7071/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "docId": "test-123",
    "options": {
      "readingLevel": "grade6",
      "length": "medium"
    },
    "chunks": [
      {
        "id": "c0",
        "seq": 0,
        "start": 0,
        "end": 100,
        "tokenEstimate": 25,
        "text": "The proposed methodology leverages a multifaceted approach to enhance comprehension across heterogeneous user cohorts."
      }
    ]
  }'
```

#### Using PowerShell:
```powershell
$body = @{
    docId = "test-123"
    options = @{
        readingLevel = "grade6"
        length = "medium"
    }
    chunks = @(
        @{
            id = "c0"
            seq = 0
            start = 0
            end = 100
            tokenEstimate = 25
            text = "The proposed methodology leverages a multifaceted approach to enhance comprehension across heterogeneous user cohorts."
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:7071/api/summarize" -Method POST -Body $body -ContentType "application/json"
```

## 📋 API Documentation

### POST `/api/summarize`

Simplifies document chunks based on specified reading level and length preferences.

#### Request Body:
```json
{
  "docId": "string (required)",
  "options": {
    "readingLevel": "grade3|grade6|grade9|college",
    "length": "short|medium|long"
  },
  "chunks": [
    {
      "id": "string (required)",
      "seq": "number (required)",
      "start": "number",
      "end": "number", 
      "tokenEstimate": "number (required)",
      "text": "string (required)"
    }
  ]
}
```

#### Response:
```json
{
  "docId": "string",
  "processedAt": "datetime",
  "options": { ... },
  "summary": {
    "totalChunks": "number",
    "totalTokensEstimate": "number",
    "readingLevel": "string",
    "length": "string"
  },
  "chunks": [
    {
      "id": "string",
      "seq": "number",
      "start": "number",
      "end": "number",
      "originalTokenEstimate": "number",
      "originalText": "string",
      "simplifiedText": "string",
      "simplificationRatio": "number",
      "readingLevel": "string",
      "processedAt": "datetime",
      "error": "string?"
    }
  ]
}
```

## 🔧 Configuration

### Azure OpenAI Setup

1. **Create Azure OpenAI Resource**: 
   - Go to Azure Portal and create an Azure OpenAI resource
   - Deploy a GPT model (e.g., gpt-4, gpt-35-turbo)
   - Note down the endpoint, API key, and deployment name

2. **Configure Local Settings** (`local.settings.json`):
   ```json
   {
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
       "AZURE_OPENAI_ENDPOINT": "https://your-resource-name.openai.azure.com/",
       "AZURE_OPENAI_API_KEY": "your-api-key-here",
       "AZURE_OPENAI_DEPLOYMENT_NAME": "gpt-4"
     }
   }
   ```

### Reading Level Configuration

The system supports multiple reading levels with specific vocabulary and sentence structure guidelines:

- **Grade 3**: Very simple vocabulary, 8 words per sentence max
- **Grade 6**: Common vocabulary, 15 words per sentence max  
- **Grade 9**: Standard vocabulary, 20 words per sentence max
- **College**: Advanced vocabulary, 25 words per sentence max

### Length Options

- **Short**: 25% of original length (key points only)
- **Medium**: 50% of original length (balanced summary)
- **Long**: 75% of original length (detailed with simplification)

### System Prompts

The service uses accessibility-focused system prompts designed specifically for users with learning disabilities. The system prompt is configured in `appsettings.json` and includes:

- Guidelines for simple, common words
- Instructions for short, clear sentences
- Directives to avoid complex grammar structures
- Requirements to maintain essential meaning while improving readability
- Emphasis on active voice and breaking down complex concepts

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Integration Tests
```bash
# Start function locally
func start

# Run integration tests
dotnet test --filter Category=Integration
```

## 📦 Deployment

### Deploy to Azure

1. **Create Azure Function App**:
```bash
az functionapp create \
  --resource-group myResourceGroup \
  --consumption-plan-location westus \
  --runtime dotnet-isolated \
  --runtime-version 8 \
  --functions-version 4 \
  --name myFunctionApp \
  --storage-account mystorageaccount
```

2. **Deploy the function**:
```bash
func azure functionapp publish myFunctionApp
```

3. **Configure App Settings**:
```bash
az functionapp config appsettings set \
  --name myFunctionApp \
  --resource-group myResourceGroup \
  --settings OPENAI_API_KEY="your-key"
```

### Using Visual Studio

1. Right-click project → **Publish**
2. Choose **Azure Functions** target
3. Select or create Function App
4. Deploy

## 🔍 Monitoring

### Application Insights

The function includes Application Insights integration for:
- Request tracking
- Error logging
- Performance monitoring
- Custom telemetry

### Logs

View logs in real-time:
```bash
func logs --format json
```

## 🛠️ Development Notes

### Azure OpenAI Integration ✅

**Azure OpenAI integration is now fully implemented!** The service includes:

1. **Complete Implementation**:
   - Azure OpenAI client with proper authentication
   - Accessibility-focused system prompts for learning disabilities
   - Fallback to mock implementation when Azure OpenAI is not configured
   - Comprehensive error handling and logging

2. **Configuration-Based Activation**:
   ```csharp
   // Automatically uses Azure OpenAI when configured in local.settings.json
   // Falls back to mock implementation for development without API keys
   ```

3. **Production-Ready Features**:
   - Proper dependency injection setup
   - Strongly-typed configuration classes
   - Token estimation and response limiting
   - Detailed logging for monitoring

### Error Handling

The function includes comprehensive error handling:
- Input validation with detailed messages
- Service-level exception handling
- Graceful degradation (returns original text if simplification fails)

### Performance Considerations

- Async/await throughout for scalability
- Cancellation token support
- Efficient JSON serialization
- Structured logging for monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is part of the ReadAble Hackathon 2025.