import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import types from '@appbaseio/reactivecore/lib/utils/types';
import { MapPin, mapPinWrapper } from './addons/styles/MapPin';

import ReactiveMap from './ReactiveMap';

let OpenStreetMap;
let OpenStreetLayer;
let OpenStreetMaker;
let OpenStreetPopup;
let Icon;
let DivIcon;

class ReactiveOpenStreetMap extends Component {
	componentDidMount() {
		/* eslint-disable */
		OpenStreetMap = require('react-leaflet').Map;
		OpenStreetLayer = require('react-leaflet').TileLayer;
		OpenStreetMaker = require('react-leaflet').Marker;
		OpenStreetPopup = require('react-leaflet').Popup;
		Icon = require('leaflet').Icon;
		DivIcon = require('leaflet').DivIcon;
		this.forceUpdate();
	}

	getMarkers = ({
		showMarkers,
		renderData,
		defaultPin,
		onPopoverClick,
		resultsToRender,
		getPosition,
	}) => {
		if (showMarkers) {
			const markers = resultsToRender.map(item => {
				const position = getPosition(item);
				const openStreetMarkerProps = {
					riseOnHover: true,
				};

				const openStreetPopupPorops = {
					css: {
						'.leaflet-popup-content-wrapper': {
							borderRadius: '3px !important',
						},
					},
				};

				if (renderData) {
					const data = renderData(item);

					if ('label' in data) {
						openStreetMarkerProps.icon = new DivIcon({
							html: ReactDOMServer.renderToStaticMarkup(
								<div className={mapPinWrapper}>
									<MapPin css={{ height: 'auto' }}>{data.label}</MapPin>
									<div
										css={{
											position: 'absolute',
											left: 0,
											width: 0,
											height: 0,
											borderTop: '12px solid white',
											borderRight: '12px solid transparent',
											boxShadow: '0 2px 4px 0 rgba(0,0,0,0.15)',
										}}
									/>
									{onPopoverClick ? (
										<OpenStreetPopup {...openStreetPopupPorops}>
											{onPopoverClick(item)}
										</OpenStreetPopup>
									) : null}
								</div>,
							),
						});
						return (
							<OpenStreetMaker
								key={item._id}
								position={[position.lat, position.lng]}
								{...openStreetMarkerProps}
							>
								{onPopoverClick ? (
									<OpenStreetPopup {...openStreetPopupPorops}>
										{onPopoverClick(item)}
									</OpenStreetPopup>
								) : null}
							</OpenStreetMaker>
						);
					} else if ('icon' in data) {
						openStreetMarkerProps.icon = new Icon({
							iconUrl: data.icon,
						});
						return (
							<OpenStreetMaker
								key={item._id}
								position={[position.lat, position.lng]}
								{...openStreetMarkerProps}
							>
								{onPopoverClick ? (
									<OpenStreetPopup {...openStreetPopupPorops}>
										{onPopoverClick(item)}
									</OpenStreetPopup>
								) : null}
							</OpenStreetMaker>
						);
					}
					openStreetMarkerProps.icon = new DivIcon({
						html: ReactDOMServer.renderToStaticMarkup(data.custom),
					});
					return (
						<OpenStreetMaker
							key={item._id}
							position={[position.lat, position.lng]}
							{...openStreetMarkerProps}
						>
							{onPopoverClick ? (
								<OpenStreetPopup {...openStreetPopupPorops}>
									{onPopoverClick(item)}
								</OpenStreetPopup>
							) : null}
						</OpenStreetMaker>
					);
				} else if (defaultPin) {
					openStreetMarkerProps.icon = new Icon({
						iconUrl: defaultPin,
					});
				}
				return (
					<OpenStreetMaker
						key={item._id}
						position={[position.lat, position.lng]}
						{...openStreetMarkerProps}
					>
						{onPopoverClick ? (
							<OpenStreetPopup {...openStreetPopupPorops}>
								{onPopoverClick(item)}
							</OpenStreetPopup>
						) : null}
					</OpenStreetMaker>
				);
			});

			return markers;
		}
		return null;
	};

	renderMap = params => {
		// we check for `OpenStreetMap` here instead of `window`
		// because leaflet and react-leaflet are incompatible with SSR setup
		// hence the leaflet modules are imported on mount and the component
		// is force-rendered to avail the map module
		if (typeof OpenStreetMap === 'undefined') return null;
		const markers = this.getMarkers(params);

		const style = {
			width: '100%',
			height: '100%',
			position: 'relative',
		};

		return (
			<OpenStreetMap
				style={style}
				zoom={params.zoom}
				center={[params.center.lat, params.center.lng]}
				css={{
					'.leaflet-div-icon': {
						width: 'auto !important',
						border: 0,
					},
					'.leaflet-popup-content-wrapper': {
						borderRadius: '3px !important',
					},
				}}
				touchZoom
			>
				<OpenStreetLayer
					url={this.props.tileServer || 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'}
				/>
				{markers}
				{this.props.showMarkers && this.props.markers}
			</OpenStreetMap>
		);
	};

	render() {
		return <ReactiveMap {...this.props} renderMap={this.renderMap} />;
	}
}

ReactiveOpenStreetMap.propTypes = {
	tileServer: types.string,
	showMarkers: types.bool,
	markers: types.children,
};

export default ReactiveOpenStreetMap;
