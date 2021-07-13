import React, { memo, useState} from "react";
import PropTypes from 'prop-types';
import { Button, Dialog, DialogTitle, Paper, TextField } from "@material-ui/core";
import '../styles/popup.css';

function UserPopup(props) {
    const [popupToggle, setPopupToggle] = useState(true);
    const [userDetails, setUserDetails] = useState({
        name: ''
    });

    const handleChange = (event) => {
        const { value } = event.target;
        setUserDetails({ name: value });
    }

    const handleSubmit = (event) => {
       
        if (event.type === 'keyup'&& event.key!=='Enter' ) {
            return;
        }
        if (userDetails.name.length > 0) {
            props.submitHandle(userDetails);
            setPopupToggle(false);
        }
       
    }

    return (
        <React.Fragment>
            <Dialog disableBackdropClick={true} className="user-popup" onClose={() => setPopupToggle(false)} open={popupToggle}>
                <Paper className="user-popup-paper" onKeyUp={handleSubmit} align="center">
                    <DialogTitle className="user-popup-title" >Enter Your Name</DialogTitle>
                    
                    <div className="user-details-wrapper">
                        <TextField
                            required
                            title="Name"
                            id="outlined-required"
                            className="user-popup-input"
                            label="Name"
                            variant="outlined"
                            onChange={handleChange} 
                            placeholder="Name"
                           
                        />
                        <Button className="user-popup-button" color="primary" onClick={handleSubmit}>START</Button>
                    </div>
                </Paper>
            </Dialog>
        </React.Fragment>
    )
}

UserPopup.propTypes = {
    submitHandle: PropTypes.func
}

export default memo(UserPopup);