<?php
namespace App\Service;

class Tictactoe{
    private $map = [0,0,0,0,0,0,0,0,0]; 

    //return true if player is manipulating request or app
    public function userMove(int $number): bool{
        if($this->map[$number] == 0){
            $this->map[$number] = 1;
            return false;
        }
        return true;
    }

    public function botMove():void{
        $emptyBoxs = [];
        foreach ($this->map as $box => $value) {
            if($value==0){
                array_push($emptyBoxs, $box);
            }
        }
        $numberOfPlayableBox = count($emptyBoxs);
        if($numberOfPlayableBox > 0){
            $positionInEmptyBoxs = rand(0,($numberOfPlayableBox-1));
        }
        $boxChosen = $emptyBoxs[$positionInEmptyBoxs];
        $this->map[$boxChosen] = 2;
    }

    public function getMap():array{
        return $this->map;
    }

    public function reset():void{
        $this->map = [0,0,0,0,0,0,0,0,0]; 
    }
    
    /*
    0 = none
    1 = player win
    2 = bot win
    3 = draw
    */
    public function checkIfWinner(){
        for ($x=1; $x < 3; $x++) { 
            if($this->map[0] == $x && $this->map[1] == $x && $this->map[2] == $x) {return $x;}
            else if($this->map[3] == $x && $this->map[4] == $x && $this->map[5] == $x) {return $x;}
            else if($this->map[6] == $x && $this->map[7] == $x && $this->map[8] == $x) {return $x;}
            else if($this->map[0] == $x && $this->map[3] == $x && $this->map[6] == $x) {return $x;}
            else if($this->map[1] == $x && $this->map[4] == $x && $this->map[7] == $x) {return $x;}
            else if($this->map[2] == $x && $this->map[5] == $x && $this->map[8] == $x) {return $x;}
            else if($this->map[0] == $x && $this->map[4] == $x && $this->map[8] == $x) {return $x;}
            else if($this->map[2] == $x && $this->map[4] == $x && $this->map[6] == $x) {return $x;}
        }
        $hasNoZero = !in_array(0, $this->map, true);
        if($hasNoZero) return 3;
        return 0;
    }

    public function play($data):array{
        // 10 mean the bot start the round
        if ($data['box'] !== 10) {
            //check if the user selected a valid box
            $isUserMoveValid = $this->userMove($data['box']);
            if ($isUserMoveValid) {
                return $this->getMap();
            }

            $winner = $this->checkIfWinner();
            if ($winner !== 0) {
                $map = $this->getMap();
                $map[] = $winner;
                $this->reset();
                return $map;
            }
        }

        // bot's turn
        $this->botMove();
        $winner = $this->checkIfWinner();
        if ($winner !== 0) {
            $map = $this->getMap();
            $map[] = $winner;
            $this->reset();
            return $map;
        }

        // No winner, continue the game
        return $this->getMap();
    }
}