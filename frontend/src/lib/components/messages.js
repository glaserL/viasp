import PropTypes from "prop-types";
import {useColorPalette} from "../contexts/ColorPalette";
import {RiErrorWarningFill} from "react-icons/all";
import {useMessages} from "../contexts/UserMessages";
import {useEffect, useState} from "react";


function useColor(level) {
    const colors = useColorPalette();
    if (level === "error") {
        return {ten: colors.error_ten, thirty: colors.error_thirty, sixty: colors.error_sixty}
    }
    return {}
}

function Message(props) {
    const {message} = props;
    const colors = useColor(message.level);
    return <Expire delay={2000}>
        <div className="user_message" style={{backgroundColor: colors.sixty, color: colors.thirty}}>
            <RiErrorWarningFill/>{message.text}</div>
    </Expire>
}

Message.propTypes = {
    message: PropTypes.exact({
        text: PropTypes.string,
        level: PropTypes.oneOf(["error"])
    })
}

export function UserMessages() {
    const [{activeMessages},] = useMessages();
    return !activeMessages || activeMessages.length === 0 ? null :
        <div className="user_message_list">{activeMessages.map(message => <Message key={message}
                                                                                   message={message}/>)}</div>
}

function Expire(props) {
    const [isShowingAlert, setShowingAlert] = useState(true);
    const [unmount, setUnmount] = useState(false);
    const {delay} = props;

    useEffect(() => {
        setTimeout(() => {
            setShowingAlert(false);
        }, delay);
    }, []);

    return unmount ? null : <div onTransitionEnd={() => setUnmount(true)}
                                 className={`alert alert-success ${isShowingAlert ? 'alert-shown' : 'alert-hidden'}`}>{props.children}</div>

}

Expire.propTypes = {
    children: PropTypes.element,
    delay: PropTypes.number
}
Expire.defaultProps = {
    delay: 5000
}
