import "dotenv/config";

const getGeminiAPIResponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": `${process.env.GRMINI_API_KEY}`,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
    }),
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      options
    );
    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.log("Unexpected API response format:", data);
      return "Sorry, I couldn't process that.";
    }
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return "Sorry, there was an error processing your request.";
  }
};

export default getGeminiAPIResponse;
