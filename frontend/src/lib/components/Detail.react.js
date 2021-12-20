import React, {Component} from 'react';
import {backendURL, make_atoms_string} from "../../util";
import './detail.css';

class DetailForSignature extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showChildren: true,
        };
        this.toggleShowChildren = this.toggleShowChildren.bind(this)
    }

    toggleShowChildren() {
        this.setState({showChildren: !this.state.showChildren})
    }

    render() {
        const {signature, atoms} = this.props;
        return <div>
            <h3 className="detail_atom_view_heading" onClick={this.toggleShowChildren}>{signature}</h3>
            {this.state.showChildren ? atoms.map(atom => <div>{make_atoms_string(atom)}</div>) : null}
        </div>
    }
}


export class Detail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            externalData: null,
        };
    }

    render() {
        if (this.state.externalData === null) {
            return <div id="detailSidebar" className="detail">
                <h3>Stable Models</h3>
                Loading..
            </div>
        }
        return <div id="detailSidebar" className="detail">
            <h3>Stable Models</h3>
            {this.state.externalData.map((resp) =>
                <DetailForSignature key={resp[0]} signature={resp[0]} atoms={resp[1]}/>)}
        </div>
    }

    loadMyAsyncData() {
        const {shows} = this.props;
        return fetch(`${backendURL("model")}?uuid=${shows}`).then(r => r.json()).catch(error => this.setState({error}))
    }

    componentDidMount() {
        this._asyncRequest = this.loadMyAsyncData().then(
            externalData => {
                this._asyncRequest = null;
                this.setState({externalData});
                console.log("Detail SET")
                console.log(this.state)
            }
        );
    }
}
