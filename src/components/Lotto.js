import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Container, Row, Col, Card, CardBody, Button, Form, FormGroup, Label, Input, FormText  } from 'reactstrap';
import { setAccount, setNetwork } from '../actions/metamask';
import { setLotto } from '../actions/lotto';
import { pickNumber } from '../actions/pick';
import Web3 from 'web3'
import * as constants from '../constants';

class Lotto extends Component {
 
  constructor(props) {
    super(props)

    this.state = {
        metamaskError: true,
        messageAccount: '',
        messageNetwork: '',
        messageCommon: '',
        picker: false,
        number: 0,
        inputBet: 0,
        ethValue: 0,
        inputBetError: false
    }
  }

    componentDidMount(){

        let that = this;

        window.addEventListener('load', function() {

            let web3 = window.web3;
            if (typeof web3 !== 'undefined') {

                window.web3 = new Web3(web3.currentProvider);
                that.props.setWeb3(window.web3);
                that.fetchAccounts();
                that.fetchNetwork();
                that.setFIlter();
                that.Web3Interval = setInterval(() => that.fetchWeb3(), 1000);
                that.AccountInterval = setInterval(() => that.fetchAccounts(), 1000);
                that.NetworkInterval = setInterval(() => that.fetchNetwork(),  1000);
            } else {

                that.setState({metamaskError: true, messageCommon: constants.METAMASK_NOT_INSTALL});
            }
        })

    }

    setLottoData = () => {

        let {web3, dispatch, account, network} = this.props;

        if (web3 !== null && account !== null & network !== 4) {

            dispatch(setLotto(web3))
        }
    }

    fetchWeb3 = () => {

        let web3 = window.web3;

        if (typeof web3 === 'undefined') {

            this.props.setWeb3(null);
            this.setState({metamaskError:true, messageCommon: constants.METAMASK_NOT_INSTALL});
        }
    }
  
    fetchAccounts = () => {

        let {web3, dispatch, account} = this.props;

        if (web3 !== null) {

            web3.eth.getAccounts((err, accounts) => {

                if (err) {

                    this.setState({metamaskError:true, messageAccount: constants.LOAD_MATAMASK_WALLET_ERROR});
                } else {

                    if (accounts.length === 0) {

                        dispatch(setAccount(null));
                        this.setState({metamaskError:true, messageAccount: constants.EMPTY_METAMASK_ACCOUNT})
                    } else {

                        if (accounts[0] !== account) {

                            dispatch(setAccount(accounts[0]));
                            this.setState({metamaskError:false, messageAccount: ''});
                        }
                    }
                }
            }); 
        }
    }

    fetchNetwork() {

        let {web3, dispatch, network} = this.props;

        if (web3 !== null) {

          web3.version.getNetwork((err, netId) => {

            if (err) {

              dispatch(setNetwork(null));
              this.setState({metamaskError:true, messageNetwork: constants.NETWORK_ERROR });
            } else {

              if (netId !== network) {

                  if (netId !== '4'){

                    this.setState({metamaskError:true, messageNetwork: constants.WRONG_NETWORK_ERROR });
                  } else {
                    
                    dispatch(setNetwork(netId));

                    this.setLottoData();
                    this.setState({metamaskError:false, messageNetwork: ''});
                  }          
              }
            }
          });
        }
    }

    setFIlter = () => {

        let {web3} = this.props;
        let that = this;

        if (web3 !== null) {

            this.filter = web3.eth.filter('latest');
            this.filter.watch(function (err, log) {
                if (err) {
                    console.log(err);
                } else {
                    that.setLottoData();
                }
            });
        }
    }

    componentWillUnmount() {

        clearInterval(this.Web3Interval);
        clearInterval(this.AccountInterval);
        clearInterval(this.NetworkInterval);

        if (typeof  this.filter !== 'undefined'){
            this.filter.stopWatching();
        }
    }

    isBetween = (x, min, max) => {
        return x >= min && x <= max;
    }

    pickerSubmit = (event) => {
        event.preventDefault()

        let {inputBet, number} = this.state;
        let {web3, dispatch , account} = this.props;

        if (web3 !== null && account !== null) {

            if (!this.isBetween(inputBet, 1, 100000)){
                return this.setState({ inputBetError: true});
            }

            dispatch(pickNumber(web3, number, account, inputBet));

            this.setState({ inputBetError: false, picker: false, number: 0, inputBet: 0, ethValue: 0});
        }
    }

  render() {

    let { minBet, betsPerRound, betCount, roundCount, bets } = this.props
    let {number, inputBet, ethValue, picker, inputBetError,  metamaskError, messageAccount, messageCommon, messageNetwork} = this.state

    let tickets = [1,2,3,4,5,6,7,8,9,10];

    return (
      <Container>
      { (metamaskError) ? 

        <h1>
            {
                (messageCommon !== '') ? 
                    <div>
                        {messageCommon} <br/>
                    </div>   
                : 
                    ''
            }
            {
                (messageAccount !== '') ? 
                    <div>
                        {messageAccount} <br/>
                    </div>    
                : 
                    ''
            }
            {
                (messageNetwork !== '') ? 
                <div>
                    {messageNetwork} <br/>
                </div>    
            : 
                ''
            }
        </h1>
        :  
        
        <div>
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
                            <Label for="bet">Your bet (in finney)</Label>
                            <Input value={inputBet} onChange={(event) => this.setState({inputBet: event.target.value, ethValue: event.target.value * 0.001})} type="number" name="bet" id="bet" placeholder="Enter your bet" step="1" min="1" max="100000" invalid={inputBetError}/>
                            <FormText>{ethValue} ether</FormText>
                            {inputBetError ? 
                              <span className="visible error">Enter a valid bet</span>
                              : 
                              ""
                            }
                          </FormGroup>
                          <Button color="danger" onClick={() => this.setState({picker:false, number:0, inputBet: 0, ethValue: 0, inputBetError: false})}>Cancel</Button>{' '}<Button color="success">Submit</Button>
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
        </div>
      }
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
      account: state.metamask.account,
      network: state.metamask.network,
      minBet: state.lotto.minBet, 
      betsPerRound: state.lotto.betsPerRound, 
      betCount: state.lotto.betCount, 
      roundCount: state.lotto.roundCount, 
      bets: state.lotto.bets
  }
}

export default connect(mapStateToProps)(Lotto);
