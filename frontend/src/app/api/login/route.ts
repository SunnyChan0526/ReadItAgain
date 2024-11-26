import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    body.username = body.memberaccount;
    delete body.memberaccount;
    const encodedData = Object.keys(body).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(body[key]);
    }).join('&');
    const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData,
    });
    const resJson = await response.json();

    if (resJson.success === true) {
        cookies().set('accessToken', resJson.access_token, {
            httpOnly: true,
            maxAge: 30 * 60,
        });

        delete resJson.access_token;
        return NextResponse.json(resJson);
    }
    else {
        return NextResponse.json(resJson,{status:401})
    }
}