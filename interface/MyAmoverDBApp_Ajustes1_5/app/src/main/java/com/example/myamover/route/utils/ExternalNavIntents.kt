package com.example.myamover.route.utils

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri


fun openGoogleMapsToStop(context: Context, lat: Double, lng: Double) {
    val navUri = Uri.parse("google.navigation:q=$lat,$lng&mode=d")
    val intent = Intent(Intent.ACTION_VIEW, navUri).apply {
        setPackage("com.google.android.apps.maps")
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    try {
        context.startActivity(intent)
    } catch (e: ActivityNotFoundException) {
        val webUri = Uri.parse("https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving")
        context.startActivity(Intent(Intent.ACTION_VIEW, webUri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
}


fun openWazeToStop(context: Context, lat: Double, lng: Double) {
    val wazeAppUri = Uri.parse("waze://?ll=lat,lng&navigate=yes")
    val wazeIntent = Intent(Intent.ACTION_VIEW, wazeAppUri).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    if (wazeIntent.resolveActivity(context.packageManager) != null) {
        context.startActivity(wazeIntent)
    } else {
        val web = Uri.parse("https://waze.com/ul?ll=$lat,$lng&navigate=yes")
        context.startActivity(
            Intent(Intent.ACTION_VIEW, web).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
    }
}