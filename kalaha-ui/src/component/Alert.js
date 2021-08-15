import React from 'react'

const alert = React.memo(props=>{
    return <div className='alert alert-primary alert-dismissable fade show bottom-buffer' role='alert'>
        {props.msg}
        <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={props.onclick}>
            <span aria-hidden="true">&times;</span>
        </button>
    </div>

}
)


export default alert;