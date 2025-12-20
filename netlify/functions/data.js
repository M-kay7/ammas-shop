{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // netlify/functions/data.js\
export default async (req, context) => \{\
  const APPS_SCRIPT_URL =\
    "https://script.google.com/macros/s/AKfycbyD6I4PO5YxyZmdtVA7C7q9YpDTquBhgk7BPFl5BXmQgqed7IdWXh5sx6udU6HiTiTm/exec";\
\
  try \{\
    const res = await fetch(`$\{APPS_SCRIPT_URL\}?route=data`);\
    const text = await res.text();\
\
    return new Response(text, \{\
      status: 200,\
      headers: \{\
        "content-type": "application/json; charset=utf-8",\
        "access-control-allow-origin": "*",\
      \},\
    \});\
  \} catch (err) \{\
    return new Response(JSON.stringify(\{ error: "NETLIFY_PROXY_ERROR", detail: String(err) \}), \{\
      status: 500,\
      headers: \{\
        "content-type": "application/json; charset=utf-8",\
        "access-control-allow-origin": "*",\
      \},\
    \});\
  \}\
\};\
}