import React, { Component } from 'react';
import Identicon from 'identicon.js';

/**
 * @author Timur Burkholz
 * @description NavBar for site
 * @version 1.0.0
 */
class NavBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      output: '0'
    }
  }

  
  render() {
    return (
      <nav class="navbar navbar-dark bg-dark justify-content-between">
        <a class="navbar-brand">Thesis Swap</a>
        <span class="navbar-text">
          {this.props.account}&nbsp;&nbsp;
          { this.props.account
              ? <img
                className="ml-2"
                width='30'
                height='30'
                src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
                alt=""
              />
              : <span></span>
          }
        </span>
    </nav>
    );
  }
}

export default NavBar;
