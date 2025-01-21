const express = require('express');

const OpenAIApi = require('openai');

const openai = new OpenAIApi({ apiKey: "API" });

const app = express()
const port = 3001

const bodyParser = require('body-parser');
const cors = require('cors');


app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/', async (req, res) => {
    const TEST = false;

    const text = req.body.text;
    const type = req.body.type;

    console.log("_________________________________________\nIP: ", req.ip, req.headers['x-forwarded-for'] || req.connection.remoteAddress, "\nInfo: ", req.rawHeaders.toString())

    const system = "당신은 아두이노의 신입니다. 각종 센서만 봐도 아두이노를 활용한 주제와 코드가 떠오르는 아두이노 권위자 그냥 천재입니다. 또한 센서에 필요한 라이브러리와 디지털, 아날로그 핀에 대해 정확히 이해하고 알려줍니다.";

    const user1 = `다음 [준비물]만을 활용한 간단한 아두이노 코드 예제를 작성하려 해. 3개의 주제를 추천해줘.
    ${text}
[준비물] 이외의 센서나 도구는 없기 가지고 있지 않아. 앞서 말한 [준비물]만 사용하는 주제로 추천해줘.
추천 형식(Json in List):
[
    {"topic": "주제1", "detail": "내용1"},
    {"topic": "주제2", "detail": "내용2"},
    {"topic": "주제3", "detail": "내용3"}
]`;
    const user2 = `다음 [주제]와 [내용]에 대해 [준비물]만을 이용한 아두이노 코드 예제를 작성해줘.
컴포넌트의 핀 번호는 "<<>>"로 감싼 상태로 작성해줘.
[준비물] 이외의 센서나 도구는 가지고 있지 않아. 앞서 말한 [준비물]만 사용하는 예제를 작성해줘.
라이브러리를 포함한 C++ 코드만 출력해줘.
${text}`;

    if (!TEST) {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": system },
                { "role": "user", "content": `${type ? user1 : user2}` }
                // {"role": "assistant", "content": `${request}`}
            ],
            // temperature: 0.1,
            top_p: 0.1
        });
        let answer = response.choices[0].message['content'];
        console.log((type ? user1 : user2) + "\n" + answer)
        res.send(JSON.stringify({ ans: type ? answer : answer.slice(6,-3), text: text, type: type }));
    }

    else {
        const res1 = `[
{"topic": "주제1", "detail": "내용1"},
{"topic": "주제2", "detail": "내용2"},
{"topic": "주제3", "detail": "내용3"}
]`
        const res2 = `void setup() {
    pinMode(13, OUTPUT);
}
void loop() {
    digitalWrite(13, HIGH);
    delay(1000);
    digitalWrite(13, LOW);
    delay(1000);
}`

        setTimeout(() => {
            if (type)
                res.send(JSON.stringify({ ans: res1, text: text, type: type }));
            else
            res.send(JSON.stringify({ ans: res2, text: text, type: type }));
        }, 2000);
    }

});

app.listen(port, () => {
    console.log('Example app listening at http://localhost:', port);
});
