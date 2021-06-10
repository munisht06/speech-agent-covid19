﻿/*
Written by Jaime Ruiz for NUI Spring 2020 course
Use at your own risk.
*/
using System;
using System.Text;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Collections.Generic;

using Newtonsoft.Json;
using UnityEngine;
using Newtonsoft.Json.Linq;

public class GoogleJsonWebToken
{
    public const string SCOPE =
        "https://www.googleapis.com/auth/dialogflow";

    public static string GetJwt(
        string clientIdEMail,
        string keyFilePath,
        string scope)
    {
        // certificate
        var certificate = new X509Certificate2(keyFilePath, "notasecret");

        // header
        var header = new { typ = "JWT", alg = "RS256" };

        // claimset
        var times = GetExpiryAndIssueDate();
        var claimset = new
        {
            iss = clientIdEMail,
            scope = scope,
            aud = "https://www.googleapis.com/oauth2/v4/token",
            iat = times[0],
            exp = times[1],
        };

        // encoded header
        var headerSerialized = JsonConvert.SerializeObject(header);
        var headerBytes = Encoding.UTF8.GetBytes(headerSerialized);
        var headerEncoded = Base64UrlEncode(headerBytes);

        // encoded claimset
        var claimsetSerialized = JsonConvert.SerializeObject(claimset);
        var claimsetBytes = Encoding.UTF8.GetBytes(claimsetSerialized);
        var claimsetEncoded = Base64UrlEncode(claimsetBytes);

        // input
        var input = headerEncoded + "." + claimsetEncoded;
        var inputBytes = Encoding.UTF8.GetBytes(input);

        // signature
        RSACryptoServiceProvider rsa =
            (RSACryptoServiceProvider)certificate.PrivateKey;
        var signatureBytes = rsa.SignData(inputBytes, "SHA256");
        var signatureEncoded = Base64UrlEncode(signatureBytes);

        // jwt
        var jwt = headerEncoded + "." + claimsetEncoded + "." + signatureEncoded;

        return jwt;
    }

    public static WWW GetAccessTokenRequest(string jwt)
    {
        string url = "https://www.googleapis.com/oauth2/v4/token";
        WWWForm form = new WWWForm();
        form.AddField(
            "grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
        form.AddField("assertion", jwt);
        Dictionary<string, string> headers = form.headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";

        WWW www = new WWW(url, form.data, headers);
        return www;
    }

    // from JWT spec
    private static string Base64UrlEncode(byte[] input)
    {
        var output = Convert.ToBase64String(input);
        output = output.Split('=')[0]; // Remove any trailing '='s
        output = output.Replace('+', '-'); // 62nd char of encoding
        output = output.Replace('/', '_'); // 63rd char of encoding
        return output;
    }

    // from JWT spec
    private static byte[] Base64UrlDecode(string input)
    {
        var output = input;
        output = output.Replace('-', '+'); // 62nd char of encoding
        output = output.Replace('_', '/'); // 63rd char of encoding
        switch (output.Length % 4) // Pad with trailing '='s
        {
            case 0: break; // No pad chars in this case
            case 2: output += "=="; break; // Two pad chars
            case 3: output += "="; break; // One pad char
            default: throw new System.Exception("Illegal base64url string!");
        }
        var converted = Convert.FromBase64String(output); // Standard base64 decoder
        return converted;
    }

    private static int[] GetExpiryAndIssueDate()
    {
        var utc0 = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
        var issueTime = DateTime.UtcNow;

        var iat = (int)issueTime.Subtract(utc0).TotalSeconds;
        var exp = (int)issueTime.AddMinutes(55).Subtract(utc0).TotalSeconds;

        return new[] { iat, exp };
    }
}
