package de.fitpulse.sportapp;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            WebSettings settings = webView.getSettings();
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptEnabled(true);
            // Strip "; wv" so Google OAuth allows login directly inside the native app
            String ua = settings.getUserAgentString();
            if (ua != null) {
                settings.setUserAgentString(ua.replace("; wv", ""));
            }
        }
    }
}
