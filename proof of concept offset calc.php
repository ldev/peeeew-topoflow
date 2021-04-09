<?php
    $link_offset = 20; # global variable, will be included in calculate_offset


    header("Content-Type: text/plain");
    $x = array(
        'a' => array(
            'link1'
        ),
        'b' => array(
            'link1',
            'link2'
        ),
        'c' => array(
            'link1',
            'link2',
            'link3'
        ),
        'd' => array(
            'link1',
            'link2',
            'link3',
            'link4'
        ),
        'e' => array(
            'link1',
            'link2',
            'link3',
            'link4',
            'link5'
        )
    );
    var_dump($x);


    echo "\n\n---------------\n\n";

    function calculate_offset($arg){
        global $link_offset;
        $return = array(); # array to be returned

        /*
            fail safe
        */
        if($arg === 0){
            return false;
        }

        $start = ($link_offset/2)*-1*$arg+10; # lowest number
        for($i = $start; $i <= $start*-1; $i += $link_offset){
            $return[] = $i;
        }
        return $return;
    }




    echo 'Med "link offset" på ' . $__link_offset . ":\n";
    foreach($x as $node_pair => $links){
        $number_of_links = count($links);
        echo '  ' . $node_pair . ': number of links: ' . $number_of_links . "\n";

        $offsets = calculate_offset($number_of_links);

        $offset_index = 0;
        foreach($links as $link){
            echo '    nodepair "' . $node_pair . '" link "' . $link . '" should be drawn with offset ' . $offsets[$offset_index++] . "\n";
        }

    }