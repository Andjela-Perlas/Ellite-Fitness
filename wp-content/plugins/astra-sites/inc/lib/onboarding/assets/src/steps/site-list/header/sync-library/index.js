import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Toaster, Tooltip } from '@brainstormforce/starter-templates';
import ICONS from '../../../../../icons';
import { isSyncSuccess, SyncStart } from './utils';
import './style.scss';

const SyncLibrary = () => {
	const [ isLoading, setIsLoading ] = useState( false );
	const syncStatus = isSyncSuccess();

	const handleClick = async ( event ) => {
		event.stopPropagation();

		if ( isLoading ) {
			return;
		}

		setIsLoading( true );
		await SyncStart();
		setIsLoading( false );
	};

	useEffect( () => {
		if ( isLoading ) {
			window.onbeforeunload = () => {
				return true;
			};

			return () => {
				window.onbeforeunload = null;
			};
		}
	}, [ isLoading ] );

	return (
		<>
			<div
				className={ `st-sync-library ${ isLoading ? 'loading' : '' }` }
				onClick={ handleClick }
			>
				<Tooltip content={ __( 'Sync Library', 'astra-sites' ) }>
					{ ICONS.sync }
				</Tooltip>
			</div>
			{ ! isLoading && syncStatus === true && (
				<Toaster
					type="success"
					message={ __(
						'Library refreshed successfully',
						'astra-sites'
					) }
					autoHideDuration={ 5 }
					bottomRight={ true }
				/>
			) }
			{ ! isLoading && syncStatus === false && (
				<Toaster
					type="error"
					message={ __( 'Library refreshed failed!', 'astra-sites' ) }
					autoHideDuration={ 5 }
					bottomRight={ true }
				/>
			) }
		</>
	);
};

export default SyncLibrary;
