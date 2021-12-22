import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Row} from "../components/Row.react";
import {backendURL} from "../utils";
import "../components/main.css"
import {Detail} from "../components/Detail.react";
import {Search} from "../components/Search.react";
import {Facts} from "../components/Facts.react";
import "./header.css";
import {ShowAllContext, ShowAllProvider} from "../contexts/ShowAllProvider";

function ShowAllToggle() {
    const [state, dispatch] = React.useContext(ShowAllContext)
    if (state.show_all) {
        return <input type="checkbox" onClick={() => dispatch({type: "show_all"})} checked/>
    }
    return <input type="checkbox" onClick={() => dispatch({type: "show_all"})}/>

}

function AppHeader() {
    return <div className="header">
        <div id="app_title">
            <span>viASP</span>
            <span id="display_all_toggle_span">Show All:
                <ShowAllToggle/>
        </span>
        </div>
    </div>
}


export default class ViaspDash extends Component {

    constructor(props) {
        super(props);
        this.notify = this.notify.bind(this)

        this.state = {
            externalData: null,
            detail: null
        };
    }

    render() {
        if (this.state.externalData === null) {
            return <div>Loading..</div>
        }
        return <body>
        <ShowAllProvider>
            <AppHeader/>
            <div className="content">
                <Detail shows={this.state.detail} clearDetail={() => this.setState({detail: null})}>
                </Detail>
                <div className="graph_container">
                    <Facts notifyClick={this.notify}/>
                    {this.state.externalData.map((transformation) => <Row
                        key={transformation.id}
                        transformation={transformation}
                        notifyClick={this.notify}/>)}</div>
                <Search/>
                {/*<Edges/>*/}
            </div>
        </ShowAllProvider>
        </body>
    }

    notify(clickedOn) {
        // TODO: This should query the database for the actual item.
        const {setProps} = this.props;
        console.log("CLICKED ON " + JSON.stringify(clickedOn))
        // setProps({key: clickedOn, id: clickedOn, node: clickedOn, notifyClick: this.notify})
        setProps({node: clickedOn})
        this.setState({detail: clickedOn.uuid})
    }

    loadMyAsyncData() {
        return fetch(`${backendURL("rules")}`).then(r => r.json()).catch(error => this.setState({error}))
    }

    componentDidMount() {
        this._asyncRequest = this.loadMyAsyncData().then(
            externalData => {
                this._asyncRequest = null;
                console.log(this.state)
                this.setState({externalData});
                console.log(this.state)
            }
        );
    }

    componentWillUnmount() {
        if (this._asyncRequest) {
            this._asyncRequest.cancel();
        }
    }
}
ViaspDash.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
