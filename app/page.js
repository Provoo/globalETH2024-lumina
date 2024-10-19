"use client";

import { useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Files from "@/components/Files";
import * as LitJsSdk from "@lit-protocol/lit-node-client";

export default function Home() {
  const [file, setFile] = useState("");
  const [cid, setCid] = useState("");
  const [uploading, setUploading] = useState(false);
  const [decryptionCid, setDecryptionCid] = useState("");

  const inputFile = useRef(null);

  const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: "cayenne",
      });
      // then get the authSig
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: "ethereum",
      });

      const accs = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "0",
          },
        },
      ];
      const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
        accessControlConditions: accs,
        authSig,
        chain: "ethereum",
        file: fileToUpload,
        litNodeClient: litNodeClient,
        readme: "Use IPFS CID of this file to decrypt it",
      });
      const encryptedBlob = new Blob([encryptedZip], { type: "text/plain" });
      const encryptedFile = new File([encryptedBlob], fileToUpload.name);

      const formData = new FormData();
      formData.append("file", encryptedFile, encryptedFile.name);
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const ipfsHash = await res.text();
      setCid(ipfsHash);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const decryptFile = async (fileToDecrypt) => {
    try {
      // First we fetch the file from IPFS using the CID and our Gateway URL, then turn it into a blob
      const fileRes = await fetch("/api/files", {
        method: "GET",
      });

      console.log(fileRes);
      const file = await fileRes.blob();
      // We recreated the litNodeClient and the authSig
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: "cayenne",
      });
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: "ethereum",
      });
      // Then we simpyl extract the file and metadata from the zip
      // We could do more with this, like try to display it in the app UI if we wanted to
      const { decryptedFile, metadata } =
        await LitJsSdk.decryptZipFileWithMetadata({
          file: file,
          litNodeClient: litNodeClient,
          authSig: authSig,
        });
      // After we have our dcypted file we can download it
      const blob = new Blob([decryptedFile], {
        type: "application/octet-stream",
      });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = metadata.name; // Use the metadata to get the file name and type
    } catch (error) {
      alert("Trouble decrypting file");
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    uploadFile(e.target.files[0]);
  };

  const loadRecent = async () => {
    try {
      const res = await fetch("/api/files");
      const json = await res.json();
      setCid(json.ipfs_pin_hash);
    } catch (e) {
      console.log(e);
      alert("trouble loading files");
    }
  };

  return (
    <>
      <Head>
        <title>Pinata Next.js App</title>
        <meta name="description" content="Generated with create-pinata-app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pinnie.png" />
      </Head>
      <main>
        <div className="hero-background">
          <div className="container">
            <div className="logo">
              <Image
                src="/logo.png"
                alt="Pinata logo"
                height={30}
                width={115}
              />
            </div>
            <div className="hero">
              <div className="copy">
                <h1>Pinata + Next.js</h1>
                <p>
                  Update the <span className="code">.env.local</span> file to
                  set your Pinata API key and (optionally) your IPFS gateway
                  URL, restart the app, then click the Upload button and you'll
                  see uploads to IPFS just work™️. If you've already uploaded
                  files, click Load recent to see the most recently uploaded
                  file.
                </p>
                <input
                  type="file"
                  id="file"
                  ref={inputFile}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                <div className="flex-btns">
                  <button onClick={loadRecent} className="btn btn-light">
                    Load recent
                  </button>
                  <button
                    disabled={uploading}
                    onClick={() => inputFile.current.click()}
                    className="btn"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  <input
                    type="text"
                    onChange={(e) => setDecryptionCid(e.target.value)}
                    className="px-4 py-2 border-2 border-secondary rounded-3xl text-lg"
                    placeholder="Enter CID to decrypt"
                  />
                  <button
                    onClick={() => decryptFile(decryptionCid)}
                    className="mr-10 w-[150px] bg-light text-secondary border-2 border-secondary rounded-3xl py-2 px-4 hover:bg-secondary hover:text-light transition-all duration-300 ease-in-out"
                  >
                    Decrypt
                  </button>
                </div>
                {cid && (
                  <div className="file-list">
                    <Files cid={cid} />
                  </div>
                )}
              </div>
              <div className="hero-img">
                <Image
                  height={600}
                  width={600}
                  src="/hero.png"
                  alt="hero image of computer and code"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid-background">
          <div className="grid">
            <div className="card">
              <Image
                src="/ufo.png"
                alt="Pinnie floating with balloons"
                height="200"
                width="200"
              />
              <h2>Read the docs</h2>
              <p>
                SDKs, API reference, and recipes all designed to help you get
                started faster.
              </p>
              <a
                className="btn"
                href="https://docs.pinata.cloud"
                rel="noopener noreferrer"
                target="_blank"
              >
                Explore the docs
              </a>
            </div>
            <div className="card">
              <Image
                src="/rocket.png"
                alt="Pinnie with scuba gear on"
                height="200"
                width="200"
              />
              <h2>Pinata dashboard</h2>
              <p>
                Log into your Pinata dashboard to see all your files, configure
                an IPFS gateway, and more.
              </p>
              <a
                className="btn"
                href="https://app.pinata.cloud"
                rel="noopener noreferrer"
                target="_blank"
              >
                Go to the dashboard
              </a>
            </div>
          </div>
        </div>
        <div className="footer-background">
          <div className="footer">
            <p>Copyright © 2023 Pinata | All Rights Reserved </p>
            <div className="socials">
              <a href="https://twitter.com/pinatacloud" target="_blank">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#f6f6f6"
                  className="text-textColor h-6 w-6"
                  viewBox="0 0 512 512"
                >
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                </svg>
              </a>
              <a href="https://discord.gg/pinata" target="_blank">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#f6f6f6"
                  className="h-6 w-6"
                  viewBox="0 0 640 512"
                >
                  <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@pinatacloud" target="_blank">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#f6f6f6"
                  className="h-6 w-6"
                  viewBox="0 0 576 512"
                >
                  <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
