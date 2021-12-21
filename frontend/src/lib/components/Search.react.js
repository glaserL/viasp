import React, {Component} from 'react';

export class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    render() {
        return <div id="search" className="search">
            <div id="search_result" className="search_result"/>
            <ul id="active_filters" className="search_result_list">

            </ul>
            <form tabIndex="1" autoComplete="off">
                <input type="text" value={this.state.value} onKeyDownCapture={this.handleKeyDown}
                       onChange={this.handleChange} name="q"
                       id="q"/><span
                style={{fontWeight: 400}}/>
            </form>
        </div>
    }

    handleKeyDown(event) {
        console.log(event)
    }

    handleChange(event) {
        // console.log(event)
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
    }


}
