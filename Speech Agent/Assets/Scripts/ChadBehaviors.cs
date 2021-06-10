using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChadBehaviors : MonoBehaviour
{
    Animator animator;
    AudioSource audioSource;

    // Start is called before the first frame update
    void Start()
    {
        this.animator = GetComponent<Animator>();
        this.audioSource = GetComponent<AudioSource>();
    }

    // Update is called once per frame
    void Update()
    {
        /*
        if (Input.GetButtonDown("Talk"))
        {
            Debug.Log("Talk Button Pressed");
            byte[] wavBytes = System.Convert.FromBase64String(audioOutput);
            AudioClip audioClip = WavUtility.ToAudioClip(wavBytes, 0);
            this.audioSource.clip = audioClip;
            StartCoroutine(this.WaitForEnd(audioClip.length));
        }
        */
        
    }

    public void Listening(){
        this.animator.SetBool("ack", true);
    }

    public IEnumerator WaitForEnd(AudioClip audioClip)
    {
        this.animator.SetBool("ack",false);
        this.audioSource.clip = audioClip;
        this.animator.SetBool("talking", true);
        this.audioSource.Play();
        yield return new WaitForSeconds(audioClip.length);
        this.animator.SetBool("talking", false);
    }


}
