import React, { useState, useEffect, useRef } from 'react';
import { Search, Thermometer, Droplets, Wind, Sun, CloudRain, Leaf, Bug, MessageCircle, Send, Image, MapPin, AlertTriangle, CheckCircle, Calendar, Clock, BookOpen } from 'lucide-react';
import { API_KEY } from './API_KEY.1';

const getWeatherData = async (city) => {
  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);
    
    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('City not found or API error');
    }
    
    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    
    return { currentData, forecastData };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

const agricultureAdvice = (temp, humidity, rain, weatherDesc, windSpeed) => {
  const advice = [];

  if (rain > 0) {
    advice.push("💧 Rain expected – Reduce irrigation to save water.");
  } else if (temp > 32 && humidity < 50) {
    advice.push("🌞 Hot & Dry – Irrigation is recommended.");
  } else {
    advice.push("✅ Normal conditions – Monitor soil moisture before irrigating.");
  }

  if (weatherDesc.toLowerCase().includes("rain")) {
    advice.push("⚠️ Avoid pesticide spraying – Rain may wash it away.");
  } else if (windSpeed > 4) {
    advice.push("⚠️ High wind – Spraying pesticides not recommended.");
  } else {
    advice.push("🪴 Suitable conditions for spraying pesticides.");
  }

  if (temp < 20) {
    advice.push("🥶 Low temperature – Protect crops from cold stress.");
  } else if (temp > 35) {
    advice.push("🔥 High temperature – Mulching recommended to retain soil moisture.");
  }

  return advice;
};

// Comprehensive agricultural knowledge base
const agriculturalKnowledge = {
  // Irrigation
  irrigation: [
    "Water crops early in the morning or late evening to reduce evaporation losses.",
    "Drip irrigation is 30-60% more efficient than traditional flood irrigation methods.",
    "Check soil moisture before watering - insert your finger 2 inches deep; if dry, it's time to water.",
    "Mulching helps retain soil moisture and reduces irrigation frequency by up to 50%."
  ],
  
  // Soil health
  soil: [
    "Test your soil every 2-3 years to monitor pH and nutrient levels.",
    "Add organic matter like compost or farmyard manure to improve soil structure and fertility.",
    "Practice crop rotation to maintain soil health and prevent nutrient depletion.",
    "Green manuring with legumes can fix atmospheric nitrogen and improve soil fertility."
  ],
  
  // Organic farming
  organic: [
    "Neem oil is an effective natural pesticide against many common pests and diseases.",
    "Companion planting with marigolds can help repel nematodes and other pests.",
    "Vermicompost provides essential nutrients and improves soil microbial activity.",
    "Crop diversity reduces pest outbreaks and improves overall farm resilience."
  ],
  
  // Pest management
  pests: [
    "Monitor fields regularly for early pest detection - early intervention is key.",
    "Use pheromone traps for monitoring and controlling specific insect pests.",
    "Encourage natural predators like ladybugs, spiders, and birds in your farm ecosystem.",
    "Rotate pesticides with different modes of action to prevent resistance development."
  ],
  
  // Crop specific
  crops: [
    "Rice requires standing water during the vegetative stage but should be drained before flowering.",
    "Tomatoes need consistent watering to prevent blossom end rot and fruit cracking.",
    "Wheat responds well to split applications of nitrogen fertilizer at tillering and stem elongation stages.",
    "Maize requires adequate zinc application, especially in alkaline soils."
  ],
  
  // Weather related
  weather: [
    "During heat waves, provide temporary shade for young plants and increase irrigation frequency.",
    "Before heavy rainfall, ensure proper drainage to prevent waterlogging and root rot.",
    "Frost protection methods include covering plants, using wind machines, or applying anti-transpirants.",
    "High humidity periods increase disease risk - ensure proper plant spacing for air circulation."
  ],
  
  // General farming
  farming: [
    "Keep detailed farm records of inputs, yields, and weather conditions for better decision making.",
    "Intercropping can increase land use efficiency and provide additional income streams.",
    "Conservation tillage helps reduce soil erosion and improves water retention.",
    "Integrated Pest Management (IPM) combines biological, cultural, and chemical methods for sustainable pest control."
  ]
};

// Function to find relevant knowledge based on query
const getRelevantKnowledge = (query) => {
  const lowerQuery = query.toLowerCase();
  let relevantTopics = [];
  
  // Check for keywords in query
  if (lowerQuery.includes('water') || lowerQuery.includes('irrigat') || lowerQuery.includes('drip')) {
    relevantTopics = [...relevantTopics, ...agriculturalKnowledge.irrigation];
  }
  
  if (lowerQuery.includes('soil') || lowerQuery.includes('fertil') || lowerQuery.includes('compost')) {
    relevantTopics = [...relevantTopics, ...agriculturalKnowledge.soil];
  }
  
  if (lowerQuery.includes('organic') || lowerQuery.includes('natural') || lowerQuery.includes('chemical')) {
    relevantTopics = [...relevantTopics, ...agriculturalKnowledge.organic];
  }
  
  if (lowerQuery.includes('pest') || lowerQuery.includes('insect') || lowerQuery.includes('disease') || lowerQuery.includes('spray')) {
    relevantTopics = [...relevantTopics, ...agriculturalKnowledge.pests];
  }
  
  if (lowerQuery.includes('rice') || lowerQuery.includes('wheat') || lowerQuery.includes('tomato') || lowerQuery.includes('maize') || lowerQuery.includes('crop')) {
    relevantTopics = [...relevantTopics, ...agriculturalKnowledge.crops];
  }
  
  if (lowerQuery.includes('rain') || lowerQuery.includes('heat') || lowerQuery.includes('cold') || lowerQuery.includes('weather') || lowerQuery.includes('temperature')) {
    relevantTopics = [...relevantTopics, ...agriculturalKnowledge.weather];
  }
  
  if (lowerQuery.includes('farm') || lowerQuery.includes('agricultur') || lowerQuery.includes('grow') || lowerQuery.includes('cultivat')) {
    relevantTopics = [...relevantTopics, ...agriculturalKnowledge.farming];
  }
  
  // If no specific topic found, return general farming advice
  if (relevantTopics.length === 0) {
    relevantTopics = agriculturalKnowledge.farming;
  }
  
  // Return 2-3 random relevant tips
  const shuffled = [...relevantTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const App = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [city, setCity] = useState('Sankarankovil');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [diseaseData, setDiseaseData] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm AgroPova, your AI agricultural assistant powered by FAO and Plantwise knowledge. How can I help you with farming today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Disease database simulation
  const diseaseDatabase = {
    tomato: {
      "yellow spots": {
        name: "Early Blight",
        cause: "Fungal infection (Alternaria solani)",
        solution: "Spray copper-based fungicide every 7 days. Remove infected leaves."
      },
      "brown rings": {
        name: "Late Blight",
        cause: "Fungal infection (Phytophthora infestans)",
        solution: "Apply mancozeb spray. Avoid overhead watering."
      },
      "wilting": {
        name: "Fusarium Wilt",
        cause: "Soil-borne fungal disease",
        solution: "Use resistant varieties. Practice crop rotation."
      }
    },
    rice: {
      "yellowing leaves": {
        name: "Bacterial Blight",
        cause: "Xanthomonas oryzae",
        solution: "Use resistant varieties. Apply copper oxychloride."
      },
      "brown spots": {
        name: "Rice Blast",
        cause: "Fungal disease (Magnaporthe oryzae)",
        solution: "Apply tricyclazole fungicide. Maintain proper spacing."
      }
    }
  };

  // Handle weather fetch
  const fetchWeather = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { currentData, forecastData } = await getWeatherData(city);
      
      // Process current weather
      const current = {
        city: currentData.name,
        temperature: Math.round(currentData.main.temp),
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind?.speed || 0,
        description: currentData.weather[0].description,
        rain: currentData.rain?.['1h'] || 0,
        pressure: currentData.main.pressure,
        advice: agricultureAdvice(
          currentData.main.temp,
          currentData.main.humidity,
          currentData.rain?.['1h'] || 0,
          currentData.weather[0].description,
          currentData.wind?.speed || 0
        )
      };
      
      // Process forecast data (every 3 hours)
      const processedForecast = forecastData.list
        .filter(item => {
          const hour = new Date(item.dt * 1000).getHours();
          return hour === 9 || hour === 15; // 9 AM and 3 PM
        })
        .map(item => ({
          datetime: new Date(item.dt * 1000),
          temperature: Math.round(item.main.temp),
          humidity: item.main.humidity,
          description: item.weather[0].description,
          windSpeed: item.wind?.speed || 0,
          rain: item.rain?.['3h'] || 0,
          advice: agricultureAdvice(
            item.main.temp,
            item.main.humidity,
            item.rain?.['3h'] || 0,
            item.weather[0].description,
            item.wind?.speed || 0
          )
        }));
      
      setWeatherData(current);
      setForecastData(processedForecast);
    } catch (err) {
      setError('City not found or weather service unavailable. Please try again.');
      setWeatherData(null);
      setForecastData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disease prediction
  const predictDisease = () => {
    const crop = selectedCrop.toLowerCase();
    const symptomText = symptoms.toLowerCase();
    
    if (!diseaseDatabase[crop]) {
      setDiseaseData({
        error: `No disease database available for ${selectedCrop}. Try tomato or rice.`
      });
      return;
    }
    
    const diseases = diseaseDatabase[crop];
    let foundDisease = null;
    
    for (const [symptomKey, diseaseInfo] of Object.entries(diseases)) {
      if (symptomText.includes(symptomKey)) {
        foundDisease = {
          ...diseaseInfo,
          crop: selectedCrop,
          symptom: symptomKey
        };
        break;
      }
    }
    
    if (foundDisease) {
      setDiseaseData(foundDisease);
    } else {
      setDiseaseData({
        error: "No matching disease found. Please describe symptoms more specifically (e.g., 'yellow spots', 'brown rings', 'wilting')."
      });
    }
  };

  // Enhanced chat message handler with knowledge base
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // Generate bot response based on message content
    setTimeout(() => {
      let botResponse = "";
      const lowerMessage = inputMessage.toLowerCase();
      
      // Weather-related queries
      if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('temperature') || lowerMessage.includes('forecast')) {
        botResponse = "I can provide weather-based farming advice! Please go to the Weather Advisor tab and enter your city name to get personalized recommendations based on current conditions.";
      } 
      // Disease-related queries
      else if (lowerMessage.includes('disease') || lowerMessage.includes('pest') || lowerMessage.includes('spot') || lowerMessage.includes('leaf') || lowerMessage.includes('sick') || lowerMessage.includes('infection')) {
        botResponse = "I can help diagnose crop diseases! Please go to the Disease Predictor tab, select your crop type, and describe the symptoms you're observing for accurate identification and treatment recommendations.";
      }
      // Thank you messages
      else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        botResponse = "You're welcome! I'm here to help you with all your farming needs. Feel free to ask about weather, crop diseases, irrigation, soil health, or any other agricultural topic!";
      }
      // General farming questions - use knowledge base
      else {
        const relevantKnowledge = getRelevantKnowledge(inputMessage);
        botResponse = "Based on agricultural best practices from FAO and Plantwise knowledge sources:\n\n" + 
                     relevantKnowledge.map(tip => `• ${tip}`).join('\n') + 
                     "\n\nFor more specific advice, you can also ask about weather conditions or crop diseases using the respective tabs.";
      }
      
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize weather data
  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800">AgroPova</h1>
              <p className="text-green-600 text-sm">AI-Powered Agricultural Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{city}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-green-200 mb-8">
          <button 
            className={`px-6 py-3 font-medium text-lg ${activeTab === 'chat' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
            onClick={() => setActiveTab('chat')}
          >
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>AI Chat</span>
            </div>
          </button>
          <button 
            className={`px-6 py-3 font-medium text-lg ${activeTab === 'weather' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
            onClick={() => setActiveTab('weather')}
          >
            <div className="flex items-center space-x-2">
              <Sun className="w-5 h-5" />
              <span>Weather Advisor</span>
            </div>
          </button>
          <button 
            className={`px-6 py-3 font-medium text-lg ${activeTab === 'disease' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
            onClick={() => setActiveTab('disease')}
          >
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5" />
              <span>Disease Predictor</span>
            </div>
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-green-700 text-white">
              <h2 className="text-xl font-bold">AgroPova AI Assistant</h2>
              <p className="text-green-100">Powered by FAO, Plantwise & agricultural research</p>
            </div>
            
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-green-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about irrigation, soil health, pests, crops, or weather..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-green-600 text-white px-6 rounded-r-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <BookOpen className="w-3 h-3 mr-1" />
                Powered by agricultural knowledge from FAO, Plantwise, and ICAR
              </div>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Weather Advisor</h2>
              <p className="text-blue-100">Get farming recommendations based on current weather</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Enter Your City</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Sankarankovil"
                      />
                      <button
                        onClick={fetchWeather}
                        disabled={isLoading}
                        className="bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700 transition-colors disabled:opacity-70"
                      >
                        {isLoading ? 'Loading...' : 'Get Weather'}
                      </button>
                    </div>
                    {error && (
                      <div className="mt-2 text-red-600 text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {error}
                      </div>
                    )}
                  </div>
                  
                  {weatherData && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-3">Current Conditions in {weatherData.city}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="text-red-500" />
                          <span>{weatherData.temperature}°C</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="text-blue-500" />
                          <span>{weatherData.humidity}% Humidity</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wind className="text-gray-500" />
                          <span>{weatherData.windSpeed} m/s Wind</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CloudRain className="text-gray-500" />
                          <span>{weatherData.rain}mm Rain</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="font-medium">Weather: {weatherData.description}</p>
                        <p className="text-sm text-gray-600 mt-1">Pressure: {weatherData.pressure} hPa</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="font-bold text-lg mb-3">Agricultural Recommendations</h3>
                  {weatherData ? (
                    <div className="space-y-3">
                      {weatherData.advice.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-green-50 p-3 rounded-lg">
                          <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-6 rounded-lg text-center">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Enter a city and click "Get Weather" to receive farming recommendations</p>
                    </div>
                  )}
                  
                  {forecastData.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-bold text-lg mb-3">5-Day Forecast Highlights</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {forecastData.map((forecast, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                {forecast.datetime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <Clock className="w-4 h-4 text-gray-500 ml-2" />
                              <span>{forecast.datetime.getHours()}:00</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {forecast.temperature}°C • {forecast.humidity}% humidity • {forecast.rain}mm rain
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Advice:</span>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {forecast.advice.slice(0, 2).map((tip, i) => (
                                  <li key={i} className="text-gray-700">{tip}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disease Prediction Tab */}
        {activeTab === 'disease' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-red-600 text-white">
              <h2 className="text-xl font-bold">Crop Disease Predictor</h2>
              <p className="text-red-100">Identify diseases and get treatment recommendations</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Select Crop Type</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="tomato">Tomato</option>
                      <option value="rice">Rice</option>
                      <option value="wheat">Wheat</option>
                      <option value="maize">Maize</option>
                      <option value="cotton">Cotton</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Describe Symptoms</label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g., yellow spots on leaves, brown rings, wilting, holes in leaves..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                    />
                    <p className="text-sm text-gray-500 mt-1">Be specific about symptoms for accurate diagnosis</p>
                  </div>
                  
                  <button
                    onClick={predictDisease}
                    disabled={isLoading || !symptoms.trim()}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    <Image className="w-5 h-5 mr-2" />
                    Predict Disease
                  </button>
                </div>
                
                <div className="md:w-1/2">
                  {diseaseData ? (
                    diseaseData.error ? (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold text-red-800">Diagnosis Not Found</h3>
                            <p className="text-red-700 mt-1">{diseaseData.error}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h3 className="font-bold text-lg mb-2">Diagnosis: {diseaseData.name}</h3>
                          <p className="text-gray-700"><span className="font-medium">Affected Crop:</span> {diseaseData.crop}</p>
                          <p className="text-gray-700 mt-2"><span className="font-medium">Symptoms Matched:</span> {diseaseData.symptom}</p>
                          <p className="text-gray-700 mt-2"><span className="font-medium">Cause:</span> {diseaseData.cause}</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-bold text-green-800 mb-2">Recommended Treatment</h4>
                          <p className="text-gray-700">{diseaseData.solution}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-bold text-blue-800 mb-2">Prevention Tips</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Practice crop rotation to prevent soil-borne diseases</li>
                            <li>Use disease-resistant varieties when available</li>
                            <li>Maintain proper plant spacing for good air circulation</li>
                            <li>Remove and destroy infected plant material immediately</li>
                          </ul>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="bg-gray-100 p-8 rounded-lg text-center h-full flex flex-col items-center justify-center">
                      <Bug className="w-16 h-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Disease Prediction</h3>
                      <p className="text-gray-600 max-w-md">
                        Select your crop type and describe the symptoms you're observing to get an accurate diagnosis and treatment recommendations.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-green-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2023 AgroPova. Empowering farmers with AI-driven agricultural insights.</p>
          <p className="text-green-300 text-sm">Knowledge sources: FAO, Plantwise, ICAR, USDA Agricultural Research</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
