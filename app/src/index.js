import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  lookUpAddress: async function(message) {
    const { getTokenAddress } = this.meta.methods;
    const id = document.getElementById("lookUp").value;
    console.log('id', id)
    let status = await getTokenAddress(id).call()
    App.setStatus(`The Star Owner of star ${id} :: ${status}`);
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    console.log('account is ', this.account)
    if(!id || !name) {
      App.setStatus("You have an Empty Field !");
    } else {
      await createStar(name, id).send({from: this.account});
      App.setStatus("New Star Owner is " + this.account + ".");
    }
  },

  transferStar: async function() {
    const { transferStar } = this.meta.methods;
    const star = document.getElementById("star").value;
    const address = document.getElementById("address").value;
    console.log('account is ', this.account)
    if(!star || !address) {
      App.setStatus("You have an Empty Field !");
    } else {
      await transferStar(address, star).send({from: this.account});
      App.setStatus("The Star has been transferred !");
    }
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const id = document.getElementById("lookid").value;
    let name = await lookUptokenIdToStarInfo(id).call()
    if(name !== '') {
      App.setStatus("Star Name is " + name);
    } else {
      App.setStatus("Star Does not Exist.");
    }
  },

  // Exchange stars 
  exchangeStars: async function (){
    const { exchangeStars } = this.meta.methods;
    const starId1 = document.getElementById("star1").value;
    const starId2 = document.getElementById("star2").value;
    if(starId1 == starId2) {
      App.setStatus("You can't exchange the same star !");
    } else {
      await exchangeStars(starId1, starId2).send({from: this.account})  
      App.setStatus("Stars have been Exchanged !");
    }
  }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});