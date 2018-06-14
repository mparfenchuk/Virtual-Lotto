import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3'
import { Container, Row, Col, Card, CardBody, Button, Form, FormGroup, Label, Input, FormText  } from 'reactstrap';
import virtual_lotto from '../build/contracts/VirtualLotto.json'

let contract = require("truffle-contract");

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
        web3: new Web3(new Web3.providers.HttpProvider("http://localhost:7545")),
        wallets: [],
        picker: false,
        number: 0,
        inputBet: 0,
        ethValue: 0,
        inputWallet: "",
        inputBetError: false,
        inputWalletError: false,
        minBet: 0,
        betsPerRound: 0,
        betCount: 0,
        roundCount: 0,
        bets: [],
        VirtualLotto: contract(virtual_lotto)
    }
  }

  componentWillMount(){

    this.state.VirtualLotto.setProvider(this.state.web3.currentProvider);

    this.initLotto();
  }

  componentDidMount(){

    this.state.web3.eth.getAccounts((err, accounts) => {
      this.setState({ wallets: accounts});
    }); 
  }
  
  initLotto = () => {

    let cInstance;  
    let that = this;

    this.state.VirtualLotto.deployed().then((contractInstance) => {
      cInstance = contractInstance	

      return cInstance.minBet.call();
    }).then(function(result) {
      let finney = that.state.web3.fromWei(result.toString(), 'finney');
      that.setState({minBet:finney});

      return cInstance.betsPerRound.call()
    }).then(function(result) {
      that.setState({betsPerRound:result.toString()});

      return cInstance.roundCount.call()
    }).then(function(result) {
      that.setState({roundCount:result.toString()});

      return cInstance.betCount.call()
    }).then(function(result) {
      that.setState({betCount:result.toString()});

      return cInstance.getPlayersAmount();
    }).then(function(result) {

      for (let i = result.toString()-1; i >= 0 ; i--) {
        that.getTickets(i, cInstance);
      }
    }).catch(function(err) {

      console.log(err.message);
    });

  }

  getTickets = (player, cInstance) => {

    let that = this;
    let playerWallet;

    cInstance.players(player).then((result) => {
      playerWallet = result.toString();

      return cInstance.getPlayerTicketsAmount(player);
    }).then((result) => {

      for (let i = result.toString()-1; i >= 0 ; i--) {
        that.getTicket(playerWallet, i, cInstance);
      }
    }).catch(function(err) {

      console.log(err.message);
    });

  }

  getTicket = (playerWallet, ticket, cInstance) => {

    let that = this;

    cInstance.playerTickets(playerWallet, ticket).then((result) => {
      let finney = that.state.web3.fromWei(result[1].toString(), 'finney');

      that.setState({bets: [...this.state.bets, {number:result[0].toString(),wallet:playerWallet,amount:finney + " finney"}] });
    }).catch(function(err) {
      console.log(err.message);
    });

  }

  isBetween = (x, min, max) => {
    return x >= min && x <= max;
  }

  pickerSubmit = (event) => {
    event.preventDefault()

    var cInstance;
    let that = this;
    let {inputBet, inputWallet} = this.state;
    
    if (inputWallet.trim() === ""){
      return this.setState({ inputWalletError: true});
    }

    if (!this.isBetween(inputBet, 1, 100000)){
      return this.setState({ inputBetError: true});
    }

    this.setState({ inputWalletError:false, inputBetError: false});

    this.state.VirtualLotto.deployed().then((contractInstance) => {
      cInstance = contractInstance	

      return cInstance.pickNumber(that.state.number, {from: inputWallet, value: that.state.web3.toWei(inputBet, 'finney'), gas: 1000000});
    }).then(function(result) {

      that.setState({picker: false, number: 0, inputBet: 0, ethValue: 0, inputWallet: "", bets: []});
      that.initLotto();
    }).catch(function(err) {

      console.log(err.message);
    });
  
  }

  render() {

    let {number, wallets, inputBet, inputWallet, ethValue, picker, inputBetError, inputWalletError, minBet, 
      betsPerRound, betCount, roundCount, bets} = this.state

    let tickets = [1,2,3,4,5,6,7,8,9,10];

    return (
      <div>
        <Container>
          <h1>Virtual Lotto</h1>
          <h4>Pick number and check your luck!</h4>
          <p>The winner(s) get to keep all the money that has been pooled in the contract. If there is more than one winner, the prize money is split evenly. One address can only purchase a maximum of 4 unique tickets.</p>
          <Row className="mt-4">
            <Col md="3">
              <h4>Round №{roundCount}</h4>
            </Col>
            <Col md="3">
              <h4>Bets: {betCount}/{betsPerRound}</h4>
            </Col>
            <Col md="3">
              <h4>Min bet: {minBet} finney</h4>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
            {tickets.map((ticket, index) => (
              <span className="ticket" key={index} onClick={() => this.setState({picker: true, number: ticket})}>{ticket}</span>
            ))}
            </Col>
          </Row>
          {picker ? 
            <Row className="mb-4">
              <Col md="6">
                <Card>
                  <CardBody>
                    <Row>
                      <Col md="3" className="text-center">
                        <span className="choosen-ticket">{number}</span>
                      </Col>
                      <Col md="9">
                        <Form onSubmit={this.pickerSubmit}>
                          <FormGroup>
                            <Label for="select">Wallets</Label>
                            <Input type="select" name="select" id="select" onChange={(event) => this.setState({inputWallet: event.target.value})} value={inputWallet} invalid={inputWalletError}>
                              <option value="">Choose wallet</option>
                              {wallets.length > 0 ? 
                                wallets.map((wallet, index) => (
                                  <option value={wallet} key={index}>{wallet}</option>
                                ))
                                :
                                ""
                            }
                            </Input>
                            {inputWalletError ? 
                              <span className="visible error">Select some wallet</span>
                              : 
                              ""
                            }     
                          </FormGroup>
                          <FormGroup>
                            <Label for="bet">Your bet (in finney)</Label>
                            <Input value={inputBet} onChange={(event) => this.setState({inputBet: event.target.value, ethValue: event.target.value * 0.001})} type="number" name="bet" id="bet" placeholder="Enter your bet" step="1" min="1" max="100000" invalid={inputBetError}/>
                            <FormText>{ethValue} ether</FormText>
                            {inputBetError ? 
                              <span className="visible error">Enter a valid bet</span>
                              : 
                              ""
                            }
                          </FormGroup>
                          <Button color="danger" onClick={() => this.setState({picker:false, number:0, inputBet: 0, ethValue: 0, inputWallet: "", inputBetError: false, inputWalletError: false})}>Cancel</Button>{' '}<Button color="success">Submit</Button>
                        </Form>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
            : 
            ""
          }
          {bets.length > 0 ?
            <div>
              <h4>All tickets</h4> 
              {bets.map((bet, index) => (
                <Row key={index} className="mb-2">
                  <Col md="8">
                    <Card>
                      <CardBody>
                        <Row>
                          <Col md="3" className="text-center">
                            <span className="choosen-ticket">{bet.number}</span>
                          </Col>
                          <Col md="9">
                            <p>Wallet: <b>{bet.wallet}</b></p>
                            <p>Bet: <b>{bet.amount}</b></p>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              ))}
            </div>
            :
            ""
          }
        </Container>
      </div>
    );
  }
}

export default App;
