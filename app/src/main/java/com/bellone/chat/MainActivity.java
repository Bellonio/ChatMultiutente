package com.bellone.chat;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.material.floatingactionbutton.FloatingActionButton;

public class MainActivity extends AppCompatActivity {

    private FloatingActionButton btnAvvia = null;
    private EditText txtUser = null;
    private EditText txtAwayMsg = null;
    private EditText txtTimeout = null;
    private EditText txtPassw = null;

    private Context context = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        context = this;

        btnAvvia = findViewById(R.id.btnAvvia_main);
        txtUser = findViewById(R.id.txtUsername_main);
        txtAwayMsg = findViewById(R.id.txtAwayMsg_main);
        txtTimeout = findViewById(R.id.txtTimeout_main);
        txtPassw = findViewById(R.id.txtPassw_main);
        TextView lblErrore = findViewById(R.id.lblErrore_main);

        //quando inserisce un username non valido ritorna in questa activity con l'errore
        Bundle extras = getIntent().getExtras();
        if(extras != null){
            //Questi valori sono già stati REGISTRATI nel server
            txtAwayMsg.setVisibility(View.INVISIBLE);
            txtTimeout.setVisibility(View.INVISIBLE);
            txtPassw.setVisibility(View.INVISIBLE);

            String errore = extras.getString("error");
            String err = String.valueOf(errore.subSequence(errore.indexOf(":")+1, errore.length()));

            lblErrore.setText(err);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        btnAvvia.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                hideKeyboard(MainActivity.this);
                caricaConfigurazione();
            }
        });
    }

    public void caricaConfigurazione(){
        //(valori di default in caso dovesse solo riscrivere l'username xke non era valido)
        String username, awayMsg=null, timeout="0", passw=null;

        if(txtAwayMsg.getVisibility() == View.INVISIBLE || (txtUser.length() > 0 && txtAwayMsg.length() > 0 && txtTimeout.length() > 0 && txtPassw.length() > 0)){
            if(txtTimeout.getText().toString().equals("0")){
                Toast.makeText(context, context.getString(R.string.timeoutNonValido), Toast.LENGTH_SHORT).show();
            }else{
                username = txtUser.getText().toString();
                if(txtAwayMsg.getVisibility() == View.VISIBLE) {
                    awayMsg = txtAwayMsg.getText().toString();
                    timeout = txtTimeout.getText().toString();
                    passw = txtPassw.getText().toString();
                }

                Intent intent = new Intent(context, ChatActivity.class);
                intent.putExtra("username", username);
                intent.putExtra("awayMsg", awayMsg);
                intent.putExtra("timeout", Integer.parseInt(timeout));
                intent.putExtra("passw", passw);
                startActivity(intent);
            }
        }else{
            Toast.makeText(context, context.getString(R.string.campiNonInseriti), Toast.LENGTH_SHORT).show();
        }
    }

    public void hideKeyboard(Activity activity) {
        //https://stackoverflow.com/questions/1109022/how-do-you-close-hide-the-android-soft-keyboard-programmatically

        InputMethodManager imm = (InputMethodManager) activity.getSystemService(Activity.INPUT_METHOD_SERVICE);
        //prende la view che ha il focus dell'utente, banalmente se ci fossero più edittext prende quella su cui l'utente ha cliccato
        View view = activity.getCurrentFocus();
        //If no view currently has focus, create a new one, just so we can grab a window token from it
        if (view != null) {
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }
}