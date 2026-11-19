@extends('errors.layout')

@section('code', '500')
@section('title', 'Internal Server Error')
@section('accent_color', '#ef4444')
@section('icon', 'fa-solid fa-server')
@section('icon_bg', 'rgba(239, 68, 68, 0.1)')
@section('icon_border', 'rgba(239, 68, 68, 0.25)')
@section('badge_bg', 'rgba(239, 68, 68, 0.12)')
@section('badge_border', 'rgba(239, 68, 68, 0.28)')

@section('heading', 'Internal Server Error')

@section('message', 'An unexpected error occurred on the server while attempting to process this request. Our technical monitoring team has recorded the incident. Please try reloading the page.')

