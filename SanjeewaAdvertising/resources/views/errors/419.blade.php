@extends('errors.layout')

@section('code', '419')
@section('title', 'Page Expired')
@section('accent_color', '#8b5cf6')
@section('icon', 'fa-solid fa-clock-rotate-left')
@section('icon_bg', 'rgba(139, 92, 246, 0.1)')
@section('icon_border', 'rgba(139, 92, 246, 0.25)')
@section('badge_bg', 'rgba(139, 92, 246, 0.12)')
@section('badge_border', 'rgba(139, 92, 246, 0.28)')

@section('heading', 'Page or Session Expired')

@section('message', 'Your security verification token or session expired due to idle inactivity. Please refresh the page and try submitting your request again.')

