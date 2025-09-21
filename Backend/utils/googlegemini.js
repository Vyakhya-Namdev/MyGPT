import "dotenv/config";

const getGeminiAPIResponse = async(message) => {
    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': `${process.env.GRMINI_API_KEY}`
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: message  //req.body.text
                        }
                    ]
                }
            ]
        })
    };

    try{
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", options);
        const data = await response.json();
        // console.log(data.candidates[0].content.parts[0].text);    //Prints only output not the whole json object
        return data.candidates[0].content.parts[0].text;
    }catch(err){
        console.log(err);
    }
}

export default getGeminiAPIResponse;