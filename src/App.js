import React, { Component } from 'react';
import Lotto from './components/Lotto';
import './App.css';

class App extends Component {
 
  constructor(props) {
    super(props)

    this.state = {
        web3: null
    }
    this.setWeb3 = this.setWeb3.bind(this);
  }

  setWeb3(web3) {
    this.setState({web3});
  }

  render() {
    return (
      <div>
        <Lotto {...this.state} setWeb3={this.setWeb3}/>
      </div>
    );
  }
}

export default App;
