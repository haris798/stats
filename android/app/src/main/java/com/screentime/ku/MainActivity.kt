package com.screentime.ku

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(UsageStatsPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
