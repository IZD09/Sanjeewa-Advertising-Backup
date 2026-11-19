@extends('errors.layout')

@section('code', '403')
@section('title', 'Access Forbidden')
@section('accent_color', '#f59e0b')
@section('icon', 'fa-solid fa-user-lock')
@section('icon_bg', 'rgba(245, 158, 11, 0.1)')
@section('icon_border', 'rgba(245, 158, 11, 0.25)')
@section('badge_bg', 'rgba(245, 158, 11, 0.12)')
@section('badge_border', 'rgba(245, 158, 11, 0.28)')

@section('heading', 'Access Forbidden / Unauthorized')

@section('message', 'You do not have the required module privileges or security credentials to view this page or execute this administrative action. Please contact your system administrator if you require access.')

