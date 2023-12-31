import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import ABI from "./abi.js"

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  letter-spacing: 2px;
  padding: 10px;
  font-family: "Lucida Console", "Courier New", monospace;
  border-radius: 50px;
  border: none;
  background: url("/config/images/button.png") ;
  padding: 20px;
  font-weight: bold;
  font-size: 19px;
  color: var(--accent-text);
  width: 150px;
  cursor: pointer;
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledButton2 = styled.button`
  letter-spacing: 2px;
  font-family: "Lucida Console", "Courier New", monospace;
  border: none;
  border-radius: 13px;
  background: url("/config/images/button2_1080.png");
  padding: 15px;
  font-weight: bold;
  font-size: 20px;
  color: var(--secondary-text);
  width: 180px;
  cursor: pointer;
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
  @media (min-width: 2100px) {
    width: 230px;
    background: url("/config/images/button2_1440.png");
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 40%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 300px;
  @media (min-width: 767px) {
    width: 3000px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  background-color: var(--accent);
  width: 200px;
 @media (min-width: 1000px) {
    width: 150px;
  }
  @media (min-width: 2000px) {
    width: 180px;
  }
  transition: width 0.5s;
`;

export const StyledImg2 = styled.img`
  
  background-color: var(--accent);
  border-radius: 30px;
  width: 200px;
 @media (min-width: 900px) {
    width: 400px;
  }
  @media (min-width: 1000px) {
    width: 450px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`How many Based Apes you want to mint?`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = 6900000000000001;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    let totalCostWeiNum = cost * mintAmount
    let trueCost = BigInt(totalCostWeiNum).toString();
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: trueCost,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `You minted ${mintAmount} ${CONFIG.NFT_NAME}! Now you can see it/them on OpenSea!`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 25) {
      newMintAmount = 25;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);


  return (
    <s.Screen>
      
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 14, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bgfinal.png" : null}
      >
  
        <s.SpacerLarge />
        <s.SpacerLarge />
<s.SpacerLarge />
        
        <ResponsiveWrapper flex={1} style={{ padding: 20 }} test>
        
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            image={CONFIG.SHOW_BACKGROUND ? "/config/images/square.png" : null}
            style={{
              padding: 30,
              borderRadius: 24,
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            
            }}
          >
             
            <s.Container flex={1} jc={"center"} ai={"center"} style={{ marginTop: "-110px" }}>
            <StyledImg
              
              src={"/config/images/logo.jpg"}
            />
          <s.SpacerLarge />
          <s.TextSubTitle
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "bold",
                paddingTop: 10,
                letterSpacing: 1,
                color: "var(--accent-text)",
                marginTop: "-20px",
              }}
            >
              
              Based Bored Apes
            </s.TextSubTitle>
            <s.SpacerLarge />
            <s.TextSubTitle2
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: 1000,
                letterSpacing: 12,
                color: "var(--secondary-text)",
                marginTop: "-20px",
              }}
            >
              
              MINT LIVE
            </s.TextSubTitle2>
            <s.SpacerLarge />
            <StyledImg2 
              src={"/config/images/gif.gif"}
            />

            </s.Container>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
         
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
           <s.SpacerLarge />
           
            </s.TextDescription>
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
               <s.SpacerXSmall />
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>

                
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Cost: {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  {data.totalSupply} out of {CONFIG.MAX_SUPPLY} minted
                </s.TextTitle>
                <s.SpacerLarge />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                      
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerLarge />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    
                    {blockchain.errorMsg !== "" ? (
                      <>
                    <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>
                      
                    </s.Container>
                  </>
                )}
              </>
            )}
            
            <s.SpacerMedium />
           
          </s.Container>
          
          <s.SpacerLarge />
          
         <s.SpacerLarge />
        </ResponsiveWrapper>
        <s.SpacerMedium />
      </s.Container>

      
    </s.Screen>
  );
}

export default App;
