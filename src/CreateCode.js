import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CheckboxItems from './components/CheckboxItems.jsx'
import RadioItems from './components/RadioItem.jsx';

const items = ["LED 소자", "PIR 모션센서", "Item 3", "Item 4", "Item 5"];

const nickname = 'users'

let dataRef = doc(db, 'Users', nickname)
setDoc(dataRef, { wait: false }, { merge: true })

dataRef = doc(db, 'Users', nickname)
const updated_Data = await getDoc(dataRef)
const updated = updated_Data.data()
console.log(updated)

async function GPT_API(text, type) {
    const response = await fetch('http://203.234.62.169:3001/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            type: type
        })
    });
    return await response.json();
}

function CreateCode({isConnected, CheckCompile}) {
    const [getList, setList] = useState([]);
    const [pixItems, setItems] = useState([]);
    const [getTopic, setTopic] = useState(null);
    const [getCode, setCode] = useState(null);

    const [checkedItems, setCheckedItems] = useState([]);

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        if (checked) {
            // 체크된 경우 배열에 추가
            setCheckedItems([...checkedItems, name]);
        } else {
            // 체크 해제된 경우 배열에서 제거
            setCheckedItems(checkedItems.filter(item => item !== name));
        }
    };
    const handleRadioChange = (event) => {
        setTopic(JSON.parse(event.target.value));
    };

    const getListBtn = async () => {
        setList([])
        setItems(checkedItems)
        GPT_API(`- [준비물]: ${checkedItems.join(' 1개, ') + " 1개"}`, true).then(res => {
            console.log(res['ans'])
            setList(JSON.parse(res['ans']))
        });
    };
    const getCodeBtn = async () => {
        setCode(null)
        GPT_API(`- [준비물]: ${pixItems.join(' 1개, ') + " 1개"}
- [주제]: ${getTopic.topic}
- [내용]: ${getTopic.detail}`, false).then(res => {
            console.log(res)
            setCode(res['ans'])
            setDoc(dataRef, { code: res['ans'], wait: false }, { merge: true })
        });
    };

    return (<div className='codecreate'>
        <CheckboxItems
            items={items}
            handleCheckboxChange={handleCheckboxChange}
        />
        <p>{checkedItems.length ? `- [준비물]: ${checkedItems.join(' 1개, ') + " 1개"}` : "<checkedItems>"}</p>
        <div>
            <button disabled={!checkedItems.length || !isConnected} onClick={getListBtn}>Get List</button>
        </div>
        <RadioItems
            items={items}
            getList={getList}
            getTopic={getTopic}
            handleRadioChange={handleRadioChange}
        />
        <p>{getTopic ? `- [준비물]: ${pixItems.join(' 1개, ') + " 1개"}
- [주제]: ${getTopic.topic}
- [내용]: ${getTopic.detail}` : "<getTopic>"}</p>
        <div>
            <button disabled={!getTopic} onClick={getCodeBtn}>Get Code</button>
            <p>{getCode ? JSON.stringify(getCode) : "<getCode>"}</p>
        </div>
        <div>
            <button disabled={!getCode} onClick={() => CheckCompile("registration", getCode)}>Compile</button>
        </div>

    </div>)


};

export default CreateCode;
