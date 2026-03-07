import React from 'react';

function Profile(){
    return(
        <div>
            <ul className="list-group">
                <li className='list-group-item'><p className='h2'>Nom d'utilisteur</p></li>
                <li className='list-group-item'><p className='h2'>Email</p></li>
                <li className='list-group-item'><p className='h2'>Mot de passe</p></li>
                <li className='list-group-item'><p className='h2'>Rôle</p></li>
            </ul>
        </div>
    )
}
export default Profile;