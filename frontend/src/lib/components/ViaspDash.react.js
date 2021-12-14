import React, {Component} from 'react';
import PropTypes, {func} from 'prop-types';
import './style.css';

//
export function make_atoms_string(atoms) {
    // console.log(`IN: ${JSON.stringify(atoms)}`)
    if (Array.isArray(atoms)) {
        // console.log(`An array ${atoms}`)
        return atoms.map(make_atoms_string).join(" ")
    }
    switch (atoms._type) {
        case "Number":
            // console.log(`A number ${JSON.stringify(atoms)}`)
            return atoms.number.toString();
        case "Function":
            // console.log(`A func ${JSON.stringify(atoms)}`)
            const args = atoms.arguments.map(make_atoms_string).join(",")
            return args.length > 0 ? `${atoms.name}(${args})` : `${atoms.name}`
        default:
            throw new TypeError(`Unimplemented type ${atoms._type}`)

    }
}

// class RuleHeader extends Component {
//     render() {
//         const {rule, notifyClick} = this.props
//         return <div className="row_header" onClick={() => notifyClick(this)}>{rule}</div>
//     }
// }

export function backendURL(route) {
    const domain = "localhost"
    const port = 5000;
    const url = `http://${domain}:${port}/${route}`;
    console.log(`Returning url ${url}`)
    return url
}

class Node extends Component {
    state = {
        externalData: null,
        error: null,
    };


    loadMyAsyncData() {
        const {id} = this.props;
        return fetch(`${backendURL("node")}/${id}`).then(r => r.json())
    }

    render() {
        if (this.state.externalData === null) {
            return <div>Loading..</div>
        }
        const {notifyClick} = this.props;
        return <div onClick={() => notifyClick(this.state.externalData)}>
            <div className={"set_header"}>SIGNATURE</div>
            <div className={"set_value"}>{make_atoms_string(this.state.externalData.diff)}</div>
        </div>
    }

    componentDidMount() {
        this._asyncRequest = this.loadMyAsyncData().then(
            externalData => {
                this._asyncRequest = null;
                this.setState({externalData});
            }
        );
    }

    componentWillUnmount() {
        if (this._asyncRequest) {
            this._asyncRequest.cancel();
        }
    }
}

// class NodeRow extends Component {
//     render() {
//         if (this.state.externalData === null) {
//             return <div>Loading..</div>
//         }
//         if (this.state.error !== null) {
//             return <div>{this.state.error.toString()}</div>
//         }
//         return (<div>{this.state.externalData.map((id) => <Node key={id} id={id}/>)}</div>)
//     }
//
//     state = {
//         externalData: null,
//         error: null
//     };
//
//
//     loadMyAsyncData() {
//         const {rule_id} = this.props;
//         return fetch(`${backendURL("children")}/?rule_id=${rule_id}&ids_only=True`).then(r => r.json()).catch(error => this.setState({error}))
//     }
//
//     componentDidMount() {
//         this._asyncRequest = this.loadMyAsyncData().then(
//             externalData => {
//                 this._asyncRequest = null;
//                 this.setState({externalData});
//             }
//         );
//     }
//
//     componentWillUnmount() {
//         if (this._asyncRequest) {
//             this._asyncRequest.cancel();
//         }
//     }
// }
//
// function hehe() {
//     console.log("HEHE")
// }
//

class RowHeader extends Component {
    render() {
        const {rules} = this.props;
        return <div>{rules}</div>
    }
}

class Row extends Component {

    state = {
        externalData: null,
        error: null,
    };

    componentDidMount() {
        this._asyncRequest = this.loadMyAsyncData().then(
            externalData => {
                this._asyncRequest = null;
                this.setState({externalData});
            }
        );
    }

    componentWillUnmount() {
        if (this._asyncRequest) {
            this._asyncRequest.cancel();
        }
    }

    render() {
        const {transformation, notifyClick} = this.props;
        if (this.state.externalData === null) {
            return (
                <div className="row_container">
                    <RowHeader rule={transformation.rules}/>
                    <div>Loading Transformations..</div>
                </div>
            )
        }
        return <div className="row_container">
            <RowHeader rule={transformation.rules}/>
            <div className="row_row">{this.state.externalData.map((childID) => <Node key={childID} id={childID}
                                                                                     notifyClick={notifyClick}/>)}</div>
        </div>
    }

    loadMyAsyncData() {
        const {transformation} = this.props;
        return fetch(`${backendURL("children")}/?rule_id=${transformation.id}&ids_only=True`).then(r => r.json()).catch(error => this.setState({error}))
    }
}

export default class MyComponent extends Component {

    constructor(props) {
        super(props);
        this.notify = this.notify.bind(this)
    }

    state = {
        externalData: null
    };

    render() {
        if (this.state.externalData === null) {
            return <div>Loading..</div>
        }
        return (<div>{this.state.externalData.map((transformation) => <Row key={transformation.id}
                                                                           transformation={transformation}
                                                                           notifyClick={this.notify}/>)}</div>)
    }


    notify(clickedOn) {
        // TODO: This should query the database for the actual item.
        const {setProps} = this.props;
        // setProps({key: clickedOn, id: clickedOn, node: clickedOn, notifyClick: this.notify})
        setProps({node: clickedOn})
    }

    loadMyAsyncData() {
        const {id} = this.props
        return fetch(`${backendURL("rules")}`).then(r => r.json()).catch(error => this.setState({error}))
    }

    componentDidMount() {
        this._asyncRequest = this.loadMyAsyncData().then(
            externalData => {
                this._asyncRequest = null;
                this.setState({externalData});
            }
        );
    }

    componentWillUnmount() {
        if (this._asyncRequest) {
            this._asyncRequest.cancel();
        }
    }
}
MyComponent.propTypes = {
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
