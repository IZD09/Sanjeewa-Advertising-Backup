@extends('errors.layout')

@section('code', '429')
@section('title', 'Too Many Requests')
@section('accent_color', '#eab308')
@section('icon', 'fa-solid fa-gauge-simple-high')
@section('icon_bg', 'rgba(234, 179, 8, 0.1)')
@section('icon_border', 'rgba(234, 179, 8, 0.25)')
@section('badge_bg', 'rgba(234, 179, 8, 0.12)')
@section('badge_border', 'rgba(234, 179, 8, 0.28)')

@section('heading', 'Rate Limit Exceeded')

@section('message', 'You have generated too many automated or frequent requests in a short time frame. Please slow down and wait a few moments before continuing.')

