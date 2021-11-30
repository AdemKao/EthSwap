import React, { Component } from "react";
import Web3 from "web3";
import Token from "../abis/Token.json";
import EthSwap from "../abis/EthSwap.json";
import logo from "../logo.png";
import Navbar from "./Navbar";
import Main from "./Main";
import "./App.css";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    console.log("window.web3", window.web3);
    await this.loadBlackchainData();
  }

  async loadBlackchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    console.log("accounts :", accounts[0]);
    this.setState({ account: accounts[0] });
    console.log("this.state.account :", this.state.account);
    console.log("==============");
    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });
    //  Add Contract function
    //  Load Token
    const networkId = await web3.eth.net.getId();
    console.log("networkId", networkId);
    const tokenData = Token.networks[networkId];
    console.log("tokenData:", tokenData);
    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      this.setState({ token });
      console.log("token:", token);
      console.log("token_method", token.methods);
      let tokenBalance = await token.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ tokenBalance: tokenBalance.toString() });
      console.log("State.tokenBalance :", this.state.tokenBalance);
    } else {
      window.alert("Token contract not deployed to detected network");
    }
    //  Load EthSwap
    const ethSwapData = EthSwap.networks[networkId];
    console.log("ethSwapData:", ethSwapData);
    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
      this.setState({ ethSwap });
      console.log("ethSwap", this.state.ethSwap);
    } else {
      window.alert("EthSwap contract not deployed to detected network");
    }
    this.setState({ loading: false });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true });
    this.state.ethSwap.methods
      .buyTokens()
      .send({ value: etherAmount, from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true });
    this.state.token.methods
      .approve(this.state.ethSwap.address, tokenAmount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.state.ethSwap.methods
          .sellTokens(tokenAmount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      token: {},
      ethSwap: {},
      ethBalance: "0",
      tokenBalance: "0",
      loading: true,
    };
    console.log("Init_State:", this.state);
  }

  render() {
    console.log("State:", this.state);
    let content;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
    } else {
      content = (
        <Main
          ethBalance={this.state.ethBalance}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens}
          sellTokens={this.sellTokens}
        />
      );
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a href="" target="_blank" rel="noopener noreferrer">
                  <img src={logo} className="App-logo" alt="logo" />
                </a>
                {/* <h1>Hello, World</h1> */}
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
export default App;
