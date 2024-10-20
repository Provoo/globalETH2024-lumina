"use client";

import { useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Files from "@/components/Files";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";

import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";

export default function Home() {
  const [file, setFile] = useState("");
  const friendRegistrationRef = useRef();

  const [cid, setCid] = useState("");
  const [walrusBlobID, setwalrusBlobID] = useState("");
  const [uploading, setUploading] = useState(false);
  const [decryptionCid, setDecryptionCid] = useState("");
  const [friendAddress, setFriendAddress] = useState("");

  const inputFile = useRef(null);

  const uploadToWalrus = async (data, epochs = 1) => {
    try {
      const PUBLISHER = "http://walrus-publisher-testnet.overclock.run:9001";
      const response = await fetch(`${PUBLISHER}/v1/store`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.log("");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const blobId = result.newlyCreated.blobObject.blobId;
      setwalrusBlobID(blobId);
      console.log("Upload successful. BlobId:", blobId);
      console.log("Upload reuslt:", result);
      return result;
    } catch (error) {
      alert("Trouble uploading file with walrous");
      console.error("Error uploading to Walrus:", error);
      throw error;
    }
  };

  const downloadToWalrus = async () => {
    try {
      const PUBLISHER = "https://walrus-cache-testnet.overclock.run";
      const response = await fetch(`${PUBLISHER}/v1/walrusBlobID`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.log("");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      alert("Trouble uploading file with walrous");
      console.error("Error uploading to Walrus:", error);
      throw error;
    }
  };
  const uploadFile = async () => {
    try {
      console.log("Current friend address:", friendAddress);

      const fileRes = await fetch(`/api/memories/${friendAddress}`, {
        method: "GET",
      });
      const jsonExample = await fileRes.json();
      const memories = jsonExample.memories;
      console.log(jsonExample);

      setUploading(true);

      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: "datil-dev",
      });
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: "ethereum",
      });

      const accessControlConditions = [
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

      const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
        dataToEncrypt: new TextEncoder().encode(JSON.stringify(memories)),
        accessControlConditions,
      });

      const fileJson = {
        ciphertext,
        dataToEncryptHash,
        accessControlConditions,
      };
      console.log(JSON.stringify(fileJson));

      const walrusResponse = await uploadToWalrus(fileJson, 5);

      const encryptedBlob = new Blob([JSON.stringify(fileJson)], {
        type: "application/json",
      });
      const encryptedFile = new File([encryptedBlob], "example2.json");

      const formData = new FormData();
      formData.append("file", encryptedFile, memories.id);
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
      const fileRes = await fetch(`/api/files/${fileToDecrypt}`, {
        method: "GET",
      });
      const file = await fileRes.text();
      const walrusFile = await downloadToWalrus();
      const { accessControlConditions, ciphertext, dataToEncryptHash } =
        JSON.parse(file);
      console.log(accessControlConditions);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const ethersSigner = provider.getSigner();

      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: "datil-dev",
      });
      // then get the authSig
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: "ethereum",
      });

      console.log("authSigauthSigauthSig", authSig);
      const sessionSigs = await litNodeClient.getSessionSigs({
        chain: "ethereum",
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
        resourceAbilityRequests: [
          {
            resource: new LitAccessControlConditionResource("*"),
            ability: LitAbility.AccessControlConditionDecryption,
          },
        ],
        authNeededCallback: async ({
          resourceAbilityRequests,
          expiration,
          uri,
        }) => {
          const toSign = await createSiweMessage({
            uri,
            expiration, // 24 hours
            resources: resourceAbilityRequests,
            walletAddress: await ethersSigner.getAddress(),
            nonce: await litNodeClient.getLatestBlockhash(),
            litNodeClient: litNodeClient,
          });

          return await generateAuthSig({
            signer: ethersSigner,
            toSign,
          });
        },
      });

      const decryptString = await litNodeClient.decrypt({
        accessControlConditions,
        ciphertext, // return in ecreyption
        dataToEncryptHash, //return encryption
        chain: "ethereum",
        sessionSigs,
      });
      console.log(decryptString);
      console.log(new TextDecoder("utf-8").decode(decryptString.decryptedData));
    } catch (error) {
      alert(
        "Trouble decrypting filerouble decrypting filerouble decrypting filerouble decrypting filerouble decrypting file"
      );
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

  const handleRegistration = async () => {
    try {
      const response = await fetch("/api/registerFriend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendAddress }),
      });

      if (response.ok) {
        alert("Friend registered successfully");
        console.log("Friend registered successfully");
      } else {
        console.error("Failed to register friend");
      }
    } catch (error) {
      console.error("Error registering friend:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Lumina Demo</title>
        <meta name="description" content="Generated with create-pinata-app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pinnie.png" />
      </Head>
      <main>
        <div className="hero-background">
          <div className="container">
            <div className="logo">
              <Image src="/logo.png" alt="Pinata logo" height={50} width={50} />
            </div>
            <div className="hero">
              <div className="copy">
                <h1>Lumina + Friend</h1>
                <p>
                  Secure your digital memories with Lumina Friend, leveraging
                  cutting-edge Web3 encryption to ensure your shared moments
                  remain private and accessible only to those you{" "}
                  <span className="code">trust</span>
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
                    onClick={() => uploadFile()}
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
                    className="btn"
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
            <div className="max-w-md mx-auto ">
              <h2 className="text-2xl font-bold">Lumina Friend Registration</h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter friend's Ethereum address"
                  value={friendAddress}
                  onChange={(e) => setFriendAddress(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRegistration().catch(console.error)}
                  className="btn"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid-background"></div>
        <div className="footer-background">
          <div className="footer">
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
