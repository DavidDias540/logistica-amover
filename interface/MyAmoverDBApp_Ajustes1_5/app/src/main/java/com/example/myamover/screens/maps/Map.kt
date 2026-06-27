package com.example.myamover.screens.maps

import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme.colorScheme
import androidx.compose.material3.Text
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.myamover.BuildConfig
import com.example.myamover.R
import com.example.myamover.route.utils.openWazeToStop
import com.example.myamover.route.utils.startNavigationTo
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.Polyline
import com.google.maps.android.compose.rememberCameraPositionState


@Composable
fun MapScreen(
    windowSize: WindowWidthSizeClass,
    modifier: Modifier = Modifier,
    mode: MapMode,
) {
    val context = LocalContext.current

    // --- estado local do "próximo stop" ---
    var currentStopIndex by rememberSaveable { mutableStateOf(1) }

    var granted by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.ACCESS_FINE_LOCATION
            ) ==
                    PackageManager.PERMISSION_GRANTED ||
                    ContextCompat.checkSelfPermission(
                        context,
                        android.Manifest.permission.ACCESS_COARSE_LOCATION
                    ) ==
                    PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        granted = (result[android.Manifest.permission.ACCESS_FINE_LOCATION] == true) ||
                (result[android.Manifest.permission.ACCESS_COARSE_LOCATION] == true)
    }

    LaunchedEffect(Unit) {
        if (!granted) {
            launcher.launch(
                arrayOf(
                    android.Manifest.permission.ACCESS_FINE_LOCATION,
                    android.Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    val vm: MapRouteViewModel = viewModel(
        factory = MapRouteVmFactory(
            context.applicationContext as android.app.Application,
            BuildConfig.MAPS_API_KEY
        )
    )
    val state by vm.ui.collectAsState()

//    LaunchedEffect(granted) {
//        if (granted) vm.ensureMyLocation()
//    }

//    LaunchedEffect(mode, todayRoute, granted) {
//        if (!granted) return@LaunchedEffect
//        when (mode) {
//            is MapMode.ToSingleStop -> vm.routeToSingleStop(
//                com.google.android.gms.maps.model.LatLng(mode.lat, mode.lng)
//            )
//
//            MapMode.FullRoute -> if (todayRoute != null) vm.routeFullFromJson(todayRoute)
//        }
//    }


    LaunchedEffect(mode) {
        when (mode) {
            is MapMode.ToSingleStop -> vm.routeToSingleStop(LatLng(mode.lat, mode.lng))
            MapMode.FullRoute -> { /* Rota completa gerida pela lista de tarefas */ }
        }
    }


    val cameraState = rememberCameraPositionState()
//    LaunchedEffect(state.myLocation, granted) {
//        if (!granted) return@LaunchedEffect
//        val me = state.myLocation ?: return@LaunchedEffect
//
//        cameraState.animate(
//            CameraUpdateFactory.newLatLngZoom(me, 15f) // 14–17 costuma ficar bom
//        )
//    }

    LaunchedEffect(state.routePolyline) {
        if (state.routePolyline.isNotEmpty()) {
            val b = LatLngBounds.builder()
            state.routePolyline.forEach { b.include(it) }
            cameraState.animate(CameraUpdateFactory.newLatLngBounds(b.build(), 100))
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = cameraState,
            properties = MapProperties(isMyLocationEnabled = false),    //granted
            uiSettings = MapUiSettings(
                myLocationButtonEnabled = false,    //granted
                compassEnabled = false,  //true
                mapToolbarEnabled = false,  //true
                zoomControlsEnabled = false,
                zoomGesturesEnabled = false
            )
        ) {
            if (state.routePolyline.size >  1) {
                Polyline(points = state.routePolyline, width = 8f, color = Color.Blue)
            }
            state.markers.forEachIndexed { idx, p ->
                Marker(state = MarkerState(p), title = if (idx == 0) "Início" else "Ponto $idx", )
            }
        }

        if (state.loading) CircularProgressIndicator(Modifier.align(Alignment.Center))
        state.error?.let { Text(it, modifier = Modifier.align(Alignment.TopCenter)) }


        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Navegar para a próxima paragem individualmente
            if (mode is MapMode.ToSingleStop) {
                Button(
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.primaryContainer,
                        contentColor = colorScheme.scrim
                    ),
                    onClick = {
                        startNavigationTo(context, mode.lat, mode.lng)
                    }
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(R.drawable.googlemaps),
                            contentDescription = "Google Maps",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text("Google")
                    }
                }

                Button(
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.primaryContainer,
                        contentColor = colorScheme.scrim
                    ),
                    onClick = {
                        openWazeToStop(context, mode.lat, mode.lng)
                    }
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(R.drawable.waze),
                            contentDescription = "Waze",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text("Waze")
                    }
                }
            }
        }
    }
}



