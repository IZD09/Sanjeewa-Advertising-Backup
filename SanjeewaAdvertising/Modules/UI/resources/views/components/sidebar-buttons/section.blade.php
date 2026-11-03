@props(['title' => ''])
@php
    $sectionTitle = $title ?? ($slot->toHtml() ?: '');
@endphp
@if(!empty($sectionTitle))
    <div class="nav-section">{{ $sectionTitle }}</div>
@endif

